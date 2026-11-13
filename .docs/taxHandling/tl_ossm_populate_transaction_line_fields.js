/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 *
 * Towercom - Populate Transaction Line Project
 *
 * When the custom line field custcol_ossm_twcm_project is changed, copy the
 * selected project into the native Customer:Project / Name column on that line.
 *
 *   Sublist   | Used on                         | Native field set
 *   ----------|---------------------------------|-----------------
 *   item      | Bills, POs, invoices, SOs, etc. | customer
 *   expense   | Bills, expense lines on POs     | customer
 *   line      | Journal entries                 | entity (Name)
 *
 * If the custom field is cleared, the native field is cleared too.
 */
define([], function () {

    var CUSTOM_PROJECT_FIELD = 'custcol_ossm_twcm_project';

    // Sublist -> native field that holds the customer/project on that sublist
    var TARGET_FIELD_BY_SUBLIST = {
        item: 'customer',
        expense: 'customer',
        line: 'entity'
    };

    function fieldChanged(context) {
        if (context.fieldId !== CUSTOM_PROJECT_FIELD) return;

        var sublistId = context.sublistId;
        var targetField = TARGET_FIELD_BY_SUBLIST[sublistId];
        if (!targetField) return;

        var rec = context.currentRecord;

        var selectedProject = rec.getCurrentSublistValue({
            sublistId: sublistId,
            fieldId: CUSTOM_PROJECT_FIELD
        });

        try {
            // Custom field cleared -> clear the native field as well
            if (!selectedProject) {
                rec.setCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: targetField,
                    value: '',
                    ignoreFieldChange: false
                });
                return;
            }

            // Clear first (silently) so the set below always registers as a
            // change and triggers NetSuite's normal sourcing for the line.
            rec.setCurrentSublistValue({
                sublistId: sublistId,
                fieldId: targetField,
                value: '',
                ignoreFieldChange: true
            });

            // Short delay lets the clear settle before setting the new value.
            setTimeout(function () {
                try {
                    rec.setCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: targetField,
                        value: selectedProject,
                        ignoreFieldChange: false
                    });
                } catch (e) {
                    console.error('Towercom project populate (' + sublistId + '.' + targetField + '): ' + e.message);
                }
            }, 100);

        } catch (e) {
            console.error('Towercom project populate (' + sublistId + '.' + targetField + '): ' + e.message);
        }
    }

    return {
        fieldChanged: fieldChanged
    };
});