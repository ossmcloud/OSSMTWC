/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope public
 *@NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'O/suitlet', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', './O/oTWC_nsFileUtils.js', './data/oTWC_utils.js', './data/oTWC_file.js', './data/oTWC_fileType.js', './data/oTWC_company.js', './data/oTWC_profile.js'],
    function (file, uis, core, coreSQL, recu, nsFileUtils, twcUtils, twcFile, twcFileType, twcCompany, twcProfile) {
        var suiteLet = uis.new({ title: 'Radix File Import Utility' });
        suiteLet.get = (context, s) => {

            twcThemesUE.setForm(s.form);
            s.form.fieldHtml('nothing to do here')

        }

        suiteLet.post = (context, s) => {
            if (context.request.parameters.action == 'upload-file') {
                var payload = JSON.parse(context.request.body);

                if (!payload.fileName) { throw new Error('No file name provided'); }

                // @@TODO: get record type, based on it get record id using radix reference
                var record = getRecordInfo(payload.recordType, payload.radixId);

                var check = coreSQL.first({
                    query: `
                        select  id
                        from    ${twcFile.Type}
                        where   ${twcFile.Fields.RECORD_TYPE} = '${payload.recordType}'
                        and     ${twcFile.Fields.RECORD_ID} = '${record.id}'
                        and     ${twcFile.Fields.NAME} = ?
                    `,
                    params: [payload.fileName]
                });
                if (check) { throw new Error(`A file with same name for same record already found`); }

                // @@TODO: get folder
                var folder = getFolder(payload.recordType, record.id, record.company);


                var fileId = file.create({
                    name: `${record.id}_${payload.fileName}`,
                    fileType: nsFileUtils.getFileTypeFromExt(payload.fileName),
                    contents: payload.content,
                    encoding: file.Encoding.UTF8,
                    folder: folder,
                }).save();


                // @@NOTE: now create file record
                var twcType = RADIX_FILE_TYPES.find(t => { return t.radixType == payload.fileType; })


                var fileTypeInfo = coreSQL.first(`
                    select  top 1 fs.id, fs.name
                    from    customrecord_twc_file_type ft
                    join    customrecord_twc_file_status fs on BUILTIN.MNFILTER(custrecord_twc_file_type_statuses , 'MN_INCLUDE', '', 'TRUE', fs.id) = 'T'
                    where   ft.id = ${twcType?.twcType || 0}
                    order by fs.id desc
                `);

                var f = twcFile.get();
                f.name = payload.fileName;
                f.description = payload.description;
                f.recordType = payload.recordType;
                f.recordID = record.id;
                f.revision = '1';
                f.file = fileId;
                f.r_type = twcType?.twcType;
                f.status = fileTypeInfo?.id;
                f.imported = true;
                f.metaData = JSON.stringify({
                    radixType: twcType,
                    radixFileId: payload.radixFileId,
                    submitted: payload.submitted,

                });
                f.save();

                return { status: 'success', message: `twc file id: ${f.id}` }
            } else {
                throw new Error('Invalid or unrecognised action :(');
            }
        }


        const RADIX_FILE_TYPES = [
            { radixType: 1, radixName: 'H&S Plan', twcType: 1 },
            { radixType: 2, radixName: 'Method Statement', twcType: 2 },
            { radixType: 3, radixName: 'Towercom T&C - Profile', twcType: null },
            { radixType: 4, radixName: 'Towercom T&C - Company', twcType: null },
            { radixType: 5, radixName: 'Climber Certification', twcType: 9 },
            { radixType: 6, radixName: 'Rescue Climber Certification', twcType: 9 },
            { radixType: 7, radixName: 'RF Certification', twcType: 9 },
            { radixType: 8, radixName: 'Rooftop Certification', twcType: 9 },
            { radixType: 9, radixName: 'Climber Certification', twcType: 9 },
            { radixType: 10, radixName: 'Rescue Certification', twcType: 9 },
            { radixType: 11, radixName: 'RF Certification', twcType: 9 },
            { radixType: 12, radixName: 'Rooftop Certification', twcType: 9 },
            { radixType: 13, radixName: 'Employer Liability', twcType: 6 },
            { radixType: 14, radixName: 'Public Liability', twcType: 6 },
            { radixType: 15, radixName: 'Tower Mounted Equipment', twcType: null },
            { radixType: 16, radixName: 'Additional Tower Mounted Equipment', twcType: null },
            { radixType: 17, radixName: 'Ground & Indoor Equipment', twcType: null },
            { radixType: 18, radixName: 'Space Request', twcType: 12 },
            { radixType: 19, radixName: 'Final Drawings', twcType: 11 },
            { radixType: 20, radixName: 'Trouble Ticket', twcType: 7 },
            { radixType: 21, radixName: 'Space Request Response', twcType: 12 },
            { radixType: 22, radixName: 'TL Drawing', twcType: 11 },
            { radixType: 23, radixName: 'Space Request Response Old', twcType: 12 },
            { radixType: 24, radixName: 'Trouble Ticket Resolution', twcType: 5 },
        ]


        function getRecordInfo(type, radixId) {
            if (twcCompany.Type == type) {
                var rec = coreSQL.first(`select id from ${type} where ${twcCompany.Fields.RADIX_COMPANY_TABLE_ENTRY_NUMBER} = '${radixId}'`);
                if (!rec) { throw new Error(`No company found for Radix id: ${radixId}`) }
                return rec;

            } else if (twcProfile.Type == type) {
                var rec = coreSQL.first(`select id, custrecord_twc_prof_company as company from ${type} where ${twcProfile.Fields.RADIX_PROFILE_TABLE_ENTRY_NUMBER} = '${radixId}'`);
                if (!rec) { throw new Error(`No profile found for Radix id: ${radixId}`) }
                if (!rec.company) { throw new Error(`Profile [Radix: ${radixId} / NS: ${rec.id}] found but no company assigned to it`) }
                return rec;

            } else {
                throw new Error(`Invalid type: ${type}`);
            }
        }

        function getFolder(type, recordId, company) {
            if (twcCompany.Type == type) {
                return nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/C${recordId.pad(7)}`)
            } else if (twcProfile.Type == type) {

                return nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/C${company.pad(7)}/P${recordId.pad(7)}`)
            } else {
                throw new Error(`Invalid type: ${type}`);
            }
        }

        return {
            onRequest: uis.onRequest
        }
    });
