/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope public
 *@NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'O/suitlet', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './data/oTWC_config.js', './data/oTWC_file.js', './data/oTWC_fileUI.js', './O/oTWC_nsFileUtils.js'],
    function (file, uis, core, coreSQL, recu, twcConfig, twcFile, twcFileUI, nsFileUtils) {
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

            var folderName = `${f.recordType.replace('customrecord_twc_', '')[0].toUpperCase()}${f.recordID.pad(7)}`;
            // @@NOTE: we cannot add twcSrf or twcSaf in define as we have a conflict with the twc_utils.js module
            //          once the twcUtils reference is gone form these than we can reference them here
            if (f.recordType == 'customrecord_twc_site' || f.recordType == 'customrecord_twc_srf' || f.recordType == 'customrecord_twc_saf') {
                folderName = recu.lookUp(f.recordType, f.recordID, 'name');
            }

            var folder = nsFileUtils.createFolderIfNotExist(`${twcConfig.ROOT_FILE_FOLDER}/${folderName}`);
            f.file = saveFile(f.recordID, file.fileObject, folder);

            return f.save();


        }

        return {
            onRequest: uis.onRequest
        }
    });
