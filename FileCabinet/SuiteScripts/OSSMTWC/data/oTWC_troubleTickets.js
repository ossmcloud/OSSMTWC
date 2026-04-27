/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_troubleTicketsPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcTroubleTkt, twcUtils) => {


     
        class OSSMTWC_TroubleTickets extends twcTroubleTkt.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcTroubleTkt.Type,
            Fields: twcTroubleTkt.Fields,
            FieldsInfo: twcTroubleTkt.FieldsInfo,
            Status: twcUtils.tktStatus,
            getTktStatusName: twcUtils.getTktStatusName,
            getTktStatusStyle: twcUtils.getTktStatusStyle,
            getTktStatusHtml: twcUtils.getTktStatusHtml,

            Priority : twcUtils.tktPriority,
            getTktPriorityName: twcUtils.getTktPriorityName,
            getTktPriorityStyle: twcUtils.getTktPriorityStyle,
            getTktPriorityHtml: twcUtils.getTktPriorityHtml,


            get: function (id) {
                var rec = new OSSMTWC_TroubleTickets(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_TroubleTickets();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcTroubleTkt.Type);
            }
            
        }
    });
