/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/file', 'N/search', 'N/record', 'N/https', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js'],
    function (file, search, record, https, core, coreSql, base64) {

        function readFile(fileId) {
            try {
                var url = core.url.script('ossm_nslink_micorsvc_sl', { action: 'FILE_READ', file: fileId })
                var response = https.get({ url: url });
                if (response.code != 200) { throw new Error(response.body); }
                response = response.body;
                var dirt = response.indexOf('<!--');
                if (dirt > 0) { response = response.substring(0, dirt); }
                response = JSON.parse(response);
                if (response.status != 200) { throw new Error(response.message); }
                return response.content;
            } catch (error) {
                return file.load(fileId).getContents();
                //throw new Error(`could not retrieve file content [${fileId}]: ${error.message}`);
            }
        }

        function writeFile(fileInfo) {
            try {
                var url = core.url.script('ossm_nslink_micorsvc_sl', { action: 'FILE_WRITE' })
                var response = https.post({ url: url, body: JSON.stringify(fileInfo) });
                if (response.code != 200) { throw new Error(response.body); }
                response = JSON.parse(response.body);
                if (response.status != 200) { throw new Error(response.message); }
                return response.content;

            } catch (error) {
                // NOTE: we cannot read file contents from client script which kis extremely annoying for debug
                //       in addition we cannot use the suitelet from the server side (probably should use a RESTLet but WTF)
                //       anyway, this is a dirty but very effective and quick solution 
                //       we read/write via suitelet, if we get this error is because we are running on server so we use the N/file API

                if (error.message != 'The URL must be a fully qualified HTTPS URL.') { throw error; }

                //if (isNaN(parseInt(fileInfo.folder))) { fileInfo.folder = src.getSSFolder(fileInfo.folder); }
                var myFile = file.create({
                    name: fileInfo.name,
                    fileType: fileInfo.fileType || file.Type.PLAINTEXT,
                    contents: fileInfo.content,
                    encoding: file.Encoding.UTF8,
                    folder: fileInfo.folder,
                    isOnline: fileInfo.isOnline == 'T'
                });
                return { fileId: myFile.save() };
            }
        }

        function getFileType(mimeType) {
            if (!mimeType) { return 'PLAINTEXT'; }
            // @@TODO: not all MIME types are supported here, add as required
            if (mimeType == 'application/pdf') {
                return 'PDF';
            } else if (mimeType.indexOf('docx') > 0) {
                return 'WORD';
            } else if (mimeType.indexOf('xls') > 0) {
                return 'EXCEL';
            } else if (mimeType.indexOf('zip') > 0) {
                return 'ZIP';
            } else if (mimeType == 'text/csv') {
                return 'CSV';
            } else if (mimeType.indexOf('image') == 0) {
                return mimeType.replace('image/', '').toUpperCase() + 'IMAGE';
            } else {
                return 'PLAINTEXT'
            }
        }

        function createFolderIfNotExist(folderPath, parentId) {
            try {
                var folderArray = folderPath.split('/');
                var firstFolder = folderArray[0];
                var nextFolders = folderArray.slice(1);
                var filters = [];

                filters.push({ name: 'name', operator: 'is', values: [firstFolder] });
                if (parentId) {
                    filters.push({ name: 'parent', operator: 'anyof', values: [parentId] });
                } else {
                    filters.push({ name: 'istoplevel', operator: 'is', values: true });
                }

                var folderSearch = search.create({
                    type: search.Type.FOLDER,
                    filters: filters
                });

                var folderId = null;
                folderSearch.run().each(function (result) {
                    folderId = result.id;
                    return false;
                });

                if (!folderId) {
                    var folderRecord = record.create({ type: record.Type.FOLDER });
                    folderRecord.setValue({ fieldId: 'name', value: firstFolder });
                    if (parentId) {
                        folderRecord.setValue({ fieldId: 'parent', value: parentId });
                    }
                    folderId = folderRecord.save();
                }

                if (!nextFolders || nextFolders.length == 0) return folderId;

                return createFolderIfNotExist(nextFolders.join('/'), folderId);
            } catch (error) {
                if (error.message.indexOf('A folder with the same name already exists') >= 0) {
                    return createFolderIfNotExist(folderPath, parentId);
                }
                throw error;
            }

        }


        return {
            getFileType: getFileType,
            readFile: readFile,
            writeFile: writeFile,
            createFolderIfNotExist: createFolderIfNotExist
        }
    });
