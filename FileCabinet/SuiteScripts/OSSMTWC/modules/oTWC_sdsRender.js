/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */

define(['N/render', 'N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../ui/modules/oTWC_siteRequestUtils.js', '../modules/oTWC_sdsEngine.js', '../data/oTWC_config.js', '../data/oTWC_sds.js', '../data/oTWC_file.js', '../data/oTWC_utils.js', '../O/oTWC_nsFileUtils.js'],
    (render, file, core, recu, twcSiteRequestUtils, twcSdsEngine, twcConfig, twcSDS, twcFile, twcUtils, nsFileUtils) => {


        function renderSDS(context, recId, setStatus) {
            var userInfo = twcConfig.userInfo(context);

            const requestJSON = twcSdsEngine.getSrfInfo(recId);
            if (requestJSON.srf.length == 0) { throw new Error(`No SRF found using id: ${recId}`); }

            requestJSON.sds = twcSdsEngine.getFormData({ id: recId });

            requestJSON.logo = 'https://9061443-sb1.app.netsuite.com/core/media/media.nl?id=2&amp;c=9061443_SB1&amp;h=DLBF3L9Uup0gbcrPVFiqDAl_MlZywyZdMJO0rzYfa6EtDJn6';
            if (core.env.live()) { requestJSON.logo = 'https://9061443.app.netsuite.com/core/media/media.nl?id=2&amp;c=9061443&amp;h=DLBF3L9Uup0gbcrPVFiqDAl_MlZywyZdMJO0rzYfa6EtDJn6'; }

            const xmlFile = file.load({ id: 'SuiteScripts/OSSMTWC/XML/oTwc_print_SDS.xml' });
            const xmlString = xmlFile.getContents();
            const renderer = render.create();
            renderer.templateContent = xmlString;
            renderer.addCustomDataSource({ format: render.DataSource.OBJECT, alias: 'requestJSON', data: requestJSON });
            const pdfFile = renderer.renderAsPdf();
            pdfFile.name = `${requestJSON.sds[twcSDS.Fields.NAME]}.pdf`;

            var fType = twcSdsEngine.getSDSFileType();
            var f = twcFile.get(requestJSON.sds[twcSDS.Fields.PDF]);

            if (!f.id) {
                // @@NOTE: if the PDF does not exist we create it at the 1st print
                pdfFile.folder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/${requestJSON.siteDetails.site_id}/${requestJSON.srf.name}`);

                f.file = pdfFile.save();
                f.name = requestJSON.sds[twcSDS.Fields.NAME];
                f.recordType = twcSDS.Type;
                f.recordID = requestJSON.sds.id;
                if (fType) {
                    f.r_type = fType.value;
                    f.status = twcUtils.FileStatus.Pending;
                }
                f.uploadedBy = userInfo.profile;
                f.save();

                recu.submit(twcSDS.Type, requestJSON.sds.id, twcSDS.Fields.PDF, f.id);

            } else {
                // @@NOTE: if the file already exists we re-save it if is still draft or if we need to set the status
                //          the setStatus flag is true when the SDS is executed by TL
                if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Draft || setStatus) {
                    pdfFile.folder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/${requestJSON.siteDetails.site_id}/${requestJSON.srf.name}`);
                    f.file = pdfFile.save();
                    if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Draft) {
                        f.status = twcUtils.FileStatus.Pending;
                    } else if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Current) {
                        f.status = twcUtils.FileStatus.Approved;
                    } else if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Superseded) {
                        f.status = twcUtils.FileStatus.Superseded;
                    }
                    f.save();
                }

            }

            return pdfFile;
        }


        return {
            renderSDS: renderSDS
        }

    });
