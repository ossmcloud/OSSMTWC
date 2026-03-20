/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_safActionPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSafAction, twcUtils) => {



        class OSSMTWC_SAFAction extends twcSafAction.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSafAction.Type,
            Fields: twcSafAction.Fields,
            FieldsInfo: twcSafAction.FieldsInfo,


            get: function (id) {
                var rec = new OSSMTWC_SAFAction(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SAFAction();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSafAction.Type);
            },



            getStatusHtml(status) {
                var backgroundColor = 'silver'; var color = 'white';

                if (status == 'Pending') {
                    color = 'white';
                    backgroundColor = 'orange';
                } else if (status == 'Complete') {
                    color = 'white';
                    backgroundColor = 'green';
                } else if (status == 'AwaitingPhotos') {
                    color = 'white';
                    backgroundColor = 'magenta';
                }

                return `
                    <span class="twc-record-status-row" style="color: ${color}; background-color: ${backgroundColor};" >
                        ${status}
                    </span>
                `;
            }

        }
    });
