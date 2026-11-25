/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_equipmentPersistent.js', './oTWC_utils.js', './oTWC_icons.js'],
    (core, coreSQL, twcEquipment, twcUtils, twcIcons) => {

        // @@NOTE: equipment (i) info icon, shown before the equipment id in every table, opens the equipment details dialog (ui/views/oTWC_baseView.js: showEquipmentInfo)
        //         inline onclick (not a jQuery handler) because the table row click handler stops the event propagation, {{id}} is the equipment internal id
        const INFO_ICON_HTML = `<span class="twc-eq-info" style="cursor: pointer; margin-right: 4px; vertical-align: middle;" title="equipment details" onclick="event.stopPropagation(); event.preventDefault(); twc.page.showEquipmentInfo({{id}}); return false;">${twcIcons.get('info', 14)}</span>`;



        class OSSMTWC_Equipment extends twcEquipment.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcEquipment.Type,
            Fields: twcEquipment.Fields,
            FieldsInfo: twcEquipment.FieldsInfo,
            getInvStatusName: twcUtils.getInvStatusName,
            getInvStatusStyle: twcUtils.getInvStatusStyle,
            Status: twcUtils.SrfStatus,
            StepType: twcUtils.SrfStepType,

            get: function (id) {
                var rec = new OSSMTWC_Equipment(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Equipment();
                return rec.select(options);
            },

            lookUp: function (options) {

                var o = { fields: { id: 'value' } };
                o.fields[twcEquipment.Fields.NAME] = 'text';

                o.where = {};
                o.where[twcEquipment.Fields.CUSTOMER] = options.customer || 0;
                o.where[twcEquipment.Fields.EQUIPMENT_CLASS] = options.stepType || 0;

                o.orderBy = [twcEquipment.Fields.NAME];

                return this.select(o)
            },

            getFields: () => {
                return twcUtils.getFields(twcEquipment.Type);
            },

            // @@NOTE: html of the (i) icon for a given equipment id (for hand-built html)
            infoIconHtml: (eqId) => {
                if (!eqId) { return ''; }
                return INFO_ICON_HTML.replaceAll('{{id}}', parseInt(eqId));
            },
            // @@NOTE: ui table column option 'prefix' (O/controls/oTWC_ui_table.js), idField = the row field holding the equipment id
            infoIconPrefix: (idField) => {
                return { field: idField || 'id', html: INFO_ICON_HTML };
            },



        }
    });
