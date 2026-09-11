/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope public
 *@NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'O/suitlet', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_config.js', './data/oTWC_utils.js', './data/oTWC_file.js', './data/oTWC_fileUI.js', './O/oTWC_nsFileUtils.js'],
    function (file, uis, core, coreSQL, recu, twcConfig, twcUtils, twcFile, twcFileUI, nsFileUtils) {
        var suiteLet = uis.new({ title: 'TL Micro Service' });
        suiteLet.get = (context, s) => {
            return { status: 'success' };
        }

        suiteLet.post = (context, s) => {
            if (context.request.parameters.userPref == 'T') {
                twcConfig.setUserPref(context, context.request.body);
                return { status: 'success' };
            } else if (context.request.parameters.action == 'view-file') {
                var payload = JSON.parse(context.request.body);
                if (payload.file.twcFile) {
                    payload.file = coreSQL.first(`select custrecord_twc_file_doc as file_id from customrecord_twc_file where id = ${payload.file.twcFile}`)?.file_id;
                }
                var f = file.load(payload.file);
                if (payload.getUrl) { return { url: f.url }; }
                return { fileContent: f.getContents(), name: f.name, type: f.fileType }

            } else if (context.request.parameters.action == 'view-files') {
                var payload = JSON.parse(context.request.body);
                return { files: twcUtils.getFiles(payload) }
                var fields = twcFileUI.getUITable(twcUtils.getFiles(payload), twcConfig.userInfo(context));
                return { ui: fields };
                //return { files: twcUtils.getFiles(payload) };

            } else if (context.request.parameters.action == 'upload-file-ui') {
                var payload = JSON.parse(context.request.body);
                return twcFileUI.getUIFields(payload.file || { type: twcFileUI.RecordType }, twcConfig.userInfo(context), payload.options);

            } else if (context.request.parameters.action == 'upload-file') {
                var payload = JSON.parse(context.request.body);
                return { id: saveTwcFile(context, payload) };
                

            } else {
                throw new Error('Invalid or unrecognised action');
            }
        }

        function saveFile(recordId, fileObject, folder) {
            var nsFile = nsFileUtils.writeFile({
                name: `${recordId}_${fileObject.name}`,
                fileType: nsFileUtils.getFileType(fileObject.type),
                content: fileObject.content,
                folder: folder,
            });
            return nsFile.fileId;
        }
        function saveTwcFile(context, file) {
            var f = twcFile.get();
            f.copyFromObject(file);
            f.uploadedBy = twcConfig.userInfo(context).profile;

            if (!f.recordType || !f.recordID) { throw new Error(`Cannot save file without both record type and id`); }

            // @@NOTE: we cannot add twcSrf or twcSaf in define as we have a conflict with the twc_utils.js module
            //          once the twcUtils reference is gone form these than we can reference them here

            var folderName = '_TEMP';
            if (f.recordType == 'customrecord_twc_company') {
                folderName = `Companies/C${f.recordID.pad(7)}`;
            } else if (f.recordType == 'customrecord_twc_prof') {
                // need to retrieve the company id
                var companyId = parseInt(recu.lookUp('customrecord_twc_prof', f.recordID, 'custrecord_twc_prof_company')?.value || '0');
                folderName = `Companies/C${companyId.pad(7)}/P${f.recordID.pad(7)}`;

            } else if (f.recordType == 'customrecord_twc_site') {
                var siteId = recu.lookUp('customrecord_twc_site', f.recordID, 'custrecord_twc_site_id');
                folderName = `Sites/${siteId}`;

            } else if (f.recordType == 'customrecord_twc_srf') {
                var folderInfo = coreSQL.first(`
                    select  s.custrecord_twc_site_id as site_id, srf.name
                    from    customrecord_twc_srf srf
                    join    customrecord_twc_site s on s.id = srf.custrecord_twc_srf_site
                    where   srf.id = ${f.recordID}
                `);
                folderName = `Sites/${folderInfo.site_id}/SRF/${folderInfo.name}`;

            } else if (f.recordType == 'customrecord_twc_saf') {
                var folderInfo = coreSQL.first(`
                    select  s.custrecord_twc_site_id as site_id, saf.name
                    from    customrecord_twc_saf saf
                    join    customrecord_twc_site s on s.id = saf.custrecord_twc_saf_id
                    where   saf.id = ${f.recordID}
                `);
                folderName = `Sites/${folderInfo.site_id}/SAF/${folderInfo.name}`;

            } else if (f.recordType == 'customrecord_twc_trbl_tkt') {
                var folderInfo = coreSQL.first(`
                    select  s.custrecord_twc_site_id as site_id, ttk.name
                    from    customrecord_twc_trbl_tkt ttk
                    join    customrecord_twc_site s on s.id = ttk.custrecord_twc_trbl_tkt_site
                    where   ttk.id = ${f.recordID}
                `);
                folderName = `Sites/${folderInfo.site_id}/TTK/${folderInfo.name}`;

            }


            var folder = nsFileUtils.createFolderIfNotExist(`${twcConfig.ROOT_FILE_FOLDER}/${folderName}`);
            f.file = saveFile(f.recordID, file.fileObject, folder);

            return f.save();


        }

        return {
            onRequest: uis.onRequest
        }
    });
