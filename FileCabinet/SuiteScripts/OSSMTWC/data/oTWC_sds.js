/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_sdsPersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcSds, twcUtils) => {



        class OSSMTWC_SDS extends twcSds.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcSds.Type,
            Fields: twcSds.Fields,
            FieldsInfo: twcSds.FieldsInfo,
            Status: twcUtils.SdsStatus,
            // getSdsStatusName: twcUtils.getSdsStatusName,
            // getSdsStatusStyle: twcUtils.getSdsStatusStyle,
            // getSdsStatusHtml: twcUtils.getSdsStatusHtml,

            get: function (id) {
                var rec = new OSSMTWC_SDS(id);
                rec.load();
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_SDS();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcSds.Type);
            },

            // @@NOTE: name of the SDS PDF when downloaded / viewed: {site name (custrecord_twc_site_name, no site code)}_{customer name}_{sds number}_{sds created date (DD-MM-YYYY)}.pdf
            //         characters not allowed in file names are replaced with '-'
            //         used by: TL SDS Files list (oTWC_sdsFilesUtils.js: getSdsFiles) and the PDF stream (oTWC_print_srf_sds_sl.js)
            getPdfFileName: (siteName, customerName, sdsNumber, createdDate) => {
                const clean = (value) => { return (value || '').toString().replace(/[\\/:*?"<>|\r\n\t]+/g, '-').trim(); };
                return `${clean(siteName)}_${clean(customerName)}_${clean(sdsNumber)}_${clean(createdDate)}.pdf`;
            },

            getField: (name) => {
                for (var k in twcSds.FieldsInfo) {
                    if (twcSds.FieldsInfo[k].name == name) {
                        return twcSds.FieldsInfo[k];
                    }
                }
            }
        }
    });
