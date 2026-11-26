/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'O/form', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_equipment.js', './modules/oTWC_eqTmeGroup.js'],
    (runtime, core, oui, recu, twcEquipment, twcTmeg) => {

        const F = twcEquipment.Fields;

        function beforeLoad(context) {
            try {
                if (runtime.executionContext != runtime.ContextType.USER_INTERFACE) { return; }

                var form = oui.get(context.form);

                if (context.type == 'create') {
                    for (var p in context.request.parameters) {
                        if (p.startsWith('custrecord')) {
                            context.newRecord.setValue(p, context.request.parameters[p]);
                            form.fieldReadOnly(p);
                        }
                    }
                }


            } catch (error) {
                core.logDebug('BEFORE-LOAD', error.message);
            }
        }

        // @@NOTE: TME Group (TMEG) fallback (see modules/oTWC_eqTmeGroup.js): the main path is the SRF submit (oTWC_srfWorkflowEngine.js initEquipment)
        //          this covers native forms, the SAF move (moveAtmeToSwappedTme), xedit (submitFields) and the data migration
        //          errors are logged only: the TMEG must never block an equipment save
        function beforeSubmit(context) {
            try {
                if (context.type == context.UserEventType.DELETE) { return; }
                // @@NOTE: on xedit the new record only holds the submitted fields: the TMEG is written in afterSubmit (submitFields) instead
                if (context.type == context.UserEventType.XEDIT) { return; }

                var res = computeTmeg(context);
                if (res) { context.newRecord.setValue(F.TME_GROUP, res.tmeGroup); }

            } catch (error) {
                core.logError('TMEG-BEFORE-SUBMIT', `${context.newRecord?.id}: ${error.message}`);
            }
        }

        function afterSubmit(context) {
            try {
                if (context.type == context.UserEventType.DELETE) { return; }

                var id = context.newRecord.id;
                var tmeGroup = str(getVal(context, F.TME_GROUP));

                if (context.type == context.UserEventType.XEDIT) {
                    var res = computeTmeg(context);
                    if (res && res.tmeGroup != tmeGroup) {
                        recu.submit(twcEquipment.Type, id, F.TME_GROUP, res.tmeGroup);
                        tmeGroup = res.tmeGroup;
                    }
                    // TMEG explicitly cleared (data migration roll-back): left empty
                    if (!tmeGroup && submitted(context, F.TME_GROUP)) { return; }
                }

                if (!twcTmeg.isTme(getVal(context, F.EQUIPMENT_CLASS))) { return; }

                // new TME with no TMEG (the id was not known in beforeSubmit): its own group
                if (!tmeGroup) {
                    tmeGroup = twcTmeg.fmt(id);
                    if (!tmeGroup) { return; }
                    recu.submit(twcEquipment.Type, id, F.TME_GROUP, tmeGroup);
                }

                var oldTmeGroup = context.oldRecord ? str(context.oldRecord.getValue(F.TME_GROUP)) : '';
                if (tmeGroup == oldTmeGroup) { return; }

                // @@NOTE: the one-off backfill (scheduled script) writes the TMEs and their children itself: no propagation from here (avoids double writes)
                if (runtime.executionContext == runtime.ContextType.SCHEDULED) { return; }

                // @@NOTE: swap-in TME that inherited the TMEG of a swap-out TME that had none yet (data not backfilled): stamp the swap-out TME and its children too
                //         only looked up when the TMEG is not the TME own one (a swap-in TME), so a plain new TME costs no query
                if (tmeGroup != twcTmeg.fmt(id)) {
                    var assocEaId = getVal(context, F.ASSOCIATED_EQUIP_ACTIONS);
                    if (assocEaId) {
                        var tmeRes = twcTmeg.resolveForTme({ id: id, tmeGroup: null, assocEaId: assocEaId });
                        if (tmeRes.stampOldTmeId && tmeRes.tmeGroup == tmeGroup) { twcTmeg.stampTmeAndChildren(tmeRes.stampOldTmeId, tmeGroup); }
                    }
                }

                // TMEG of an existing TME changed: its children follow (a new TME has no children yet)
                if (context.oldRecord) { twcTmeg.stampTmeAndChildren(id, tmeGroup); }

            } catch (error) {
                core.logError('TMEG-AFTER-SUBMIT', `${context.newRecord?.id}: ${error.message}`);
            }
        }

        // returns { tmeGroup } when the TMEG must be set, null when nothing to do
        function computeTmeg(context) {
            var newRec = context.newRecord;
            var oldRec = context.oldRecord;
            var isNew = !oldRec;

            var eqClass = getVal(context, F.EQUIPMENT_CLASS);
            // GIE (or no class): no TMEG, left as is
            if (!twcTmeg.isTme(eqClass) && !twcTmeg.isChild(eqClass)) { return null; }

            var tmeGroup = str(getVal(context, F.TME_GROUP));
            var oldTmeGroup = isNew ? '' : str(oldRec.getValue(F.TME_GROUP));

            // @@NOTE: a record created on the native form (e.g. "Add Equipment" or a copy) always gets a computed TMEG: the field is inline so any value there was copied
            var nativeCreate = isNew && runtime.executionContext == runtime.ContextType.USER_INTERFACE;
            if (nativeCreate) {
                tmeGroup = '';
            } else if (context.type == context.UserEventType.XEDIT && submitted(context, F.TME_GROUP)) {
                // @@NOTE: on xedit, submitting the field counts as explicit even if the value is unchanged (avoids a query per moved child)
                //         or empty (data migration roll-back clears it: re-setting it here would make the clear pass find the record again on every restart)
                return null;
            } else if (tmeGroup && tmeGroup != oldTmeGroup) {
                // @@NOTE: TMEG set explicitly (by the SRF submit, the SAF move, the backfill, ...): accepted as is
                return null;
            }

            // recompute only on create, when the parent / class / associated action changed or when the TMEG is empty: status-only saves never touch it
            if (!isNew && tmeGroup && !changed(context, F.PARENT_TME_ID) && !changed(context, F.EQUIPMENT_CLASS) && !changed(context, F.ASSOCIATED_EQUIP_ACTIONS)) { return null; }

            if (twcTmeg.isTme(eqClass)) {
                // @@NOTE: a TME TMEG never changes once set
                if (tmeGroup) { return null; }
                // new record without an id: fmt(id) is null here, afterSubmit sets it
                var res = twcTmeg.resolveForTme({ id: newRec.id, tmeGroup: null, assocEaId: getVal(context, F.ASSOCIATED_EQUIP_ACTIONS) });
                if (res.tmeGroup) { return { tmeGroup: res.tmeGroup }; }
                // native create: clear any copied value (afterSubmit then sets fmt(id))
                return nativeCreate ? { tmeGroup: '' } : null;
            }

            // child (ATME / Feeder): the TMEG of its parent TME, a child without a parent keeps the TMEG it has (native create: none)
            var parentId = getVal(context, F.PARENT_TME_ID);
            if (!parentId) { return nativeCreate ? { tmeGroup: '' } : null; }
            var childTmeGroup = twcTmeg.resolveForChild(parentId);
            return (childTmeGroup && childTmeGroup != tmeGroup) ? { tmeGroup: childTmeGroup } : null;
        }

        function submitted(context, fieldId) {
            return context.newRecord.getFields().indexOf(fieldId) >= 0;
        }

        // @@NOTE: on xedit the new record only holds the submitted fields: the others are read from the old record
        function getVal(context, fieldId) {
            if (context.type == context.UserEventType.XEDIT && !submitted(context, fieldId)) {
                return context.oldRecord ? context.oldRecord.getValue(fieldId) : null;
            }
            return context.newRecord.getValue(fieldId);
        }

        function changed(context, fieldId) {
            if (!context.oldRecord) { return true; }
            if (context.type == context.UserEventType.XEDIT && !submitted(context, fieldId)) { return false; }
            return str(context.newRecord.getValue(fieldId)) != str(context.oldRecord.getValue(fieldId));
        }

        function str(value) {
            return (value === null || value === undefined) ? '' : String(value);
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit,
        }
    });
