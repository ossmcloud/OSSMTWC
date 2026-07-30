/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './persistent/oTWC_filePersistent.js', './oTWC_config.js', '../O/oTWC_nsFileUtils.js'],
    (core, coreSQL, recu, twcFile, twcConfig, nsFileUtils) => {



        class OSSMTWC_File extends twcFile.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }

            get fileName() {
                return this.getText(twcFile.Fields.FILE)
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
        function saveTwcFile(file) {
            var f = new OSSMTWC_File();
            f.copyFromObject(file);

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
            Type: twcFile.Type,
            Fields: twcFile.Fields,

            get: function (id) {
                var rec = new OSSMTWC_File(id);
                rec.load();
                if (rec.state == 'new') { rec.revision = 1; }
                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_File();
                return rec.select(options);
            },

            getFields: () => {
                return twcConfig.getFields(twcFile.Type);
            },

            saveFile: saveTwcFile

        }
    });
