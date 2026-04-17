/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../data/oTWC_company.js', '../../data/oTWC_companyUI.js', '../../data/oTWC_profile.js', '../../data/oTWC_file.js', '../../O/oTWC_nsFileUtils.js', '../../data/oTWC_utils.js'],
    (core, coreSQL, recu, twcCompany, twcCompanyUI, twcProfile, twcFile, nsFileUtils, twcUtils) => {

        function saveFile(recordId, fileObject, folder) {
            var nsFile = nsFileUtils.writeFile({
                name: `${recordId}_${fileObject.name}`,
                fileType: nsFileUtils.getFileType(fileObject.type),
                content: fileObject.content,
                folder: folder,
            });
            return nsFile.fileId;
        }

        function saveCompanyChildRecord(company, childRecord, options, userInfo) {
            var response = {};

            if (childRecord.delete) {
                recu.submit(childRecord.type, childRecord.id, 'isinactive', true);
                return response;
            }

            if (childRecord.type == twcFile.Type) {
                childRecord.recordType = twcCompany.Type;
                childRecord.recordID = company.id;
                // @@NOTE: if a file is uploaded we set the status to pending, even if file not new
                if (options.document.fileObject) {
                    childRecord.status = twcUtils.FileStatus.Pending;
                    if (childRecord.id) {
                        // @@NOTE: if we already have a file we increase the revision
                        if (!childRecord.revision) { childRecord.revision = 1; }
                        childRecord.revision += 1;
                    }
                }
                // @@NOTE: we could have a modified by and ony set this when record created but that may be too far, after all we can see the system notes
                childRecord.uploadedBy = userInfo.profile;

                response.id = childRecord.save()
                response.record = {
                    [twcFile.Fields.STATUS]: childRecord.status,
                    [twcFile.Fields.STATUS + '_name']: twcUtils.getFileStatusName(childRecord.status),
                    [twcFile.Fields.REVISION]: childRecord.revision,
                }

                if (options.document.fileObject) {
                    var folder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/C${company.id.pad(7)}`);
                    var fileId = saveFile(company.id, options.document.fileObject, folder);
                    recu.submit(twcFile.Type, response.id, twcFile.Fields.FILE, fileId);
                    response.fileId = fileId;
                }

            } else if (childRecord.type == twcProfile.Type) {

                // @@TODO: COMPANY PROFILE: validate data

                childRecord.company = company.id;
                response.id = childRecord.save();
                response.record = {};

                if (options.profile.certs) {
                    for (var c in options.profile.certs) {
                        var fileObject = options.profile.certs[c];
                        var folder = nsFileUtils.createFolderIfNotExist(`${twcUtils.ROOT_FILE_FOLDER}/C${company.id.pad(7)}/P${response.id.pad(7)}`);
                        var fileId = saveFile(response.id, fileObject, folder);
                        recu.submit(twcProfile.Type, response.id, `custrecord_twc_prof_${c}_filename`, fileId);
                    }
                }

                

            } else {
                throw new Error(`Invalid Child Record Type: ${childRecord.type}`)
            }

            // @@TODO: COMPANY PROFILE: handle deleted records (just set as inactive)

            return response
        }

        function getCompanyChildRecord(options, userInfo) {
            var childRecord = null;
            if (options.profile) {
                
                childRecord = twcProfile.get(options.profile.id);
                childRecord.copyFromObject(options.profile);
                childRecord.delete = options.profile.delete;
                
            } else if (options.document) {
                childRecord = twcFile.get(options.document.id);
                childRecord.copyFromObject(options.document);
                childRecord.delete = options.document.delete;
            } else {
                throw new Error(`No Child Record Found in payload`)
            }
            return childRecord;
        }


        return {
            getCompanyInfoPanels: twcCompanyUI.getCompanyInfoPanels,
            getCompanyProfilesPanel: twcCompanyUI.getCompanyProfilesPanel,


            getProfileInfo(pageData) {
                if (pageData.userInfo.isEmployee) {
                    return twcCompany.select({ noAlias: true, where: { id: pageData.recId || pageData.userInfo.companyProfile?.id || 0 } })[0];   
                } else {
                    if (!pageData.userInfo.companyProfile) { throw new Error('There is no company profile associated to your profile, contact TWC Administrator to get this resolved') }
                    return twcCompany.select({ noAlias: true, where: { id: pageData.userInfo.companyProfile?.id || 0 } })[0];
                }
            },

            saveCompanyChildRecord: (options, userInfo) => {
                var company = twcCompany.get(options.company.id);
                company.copyFromObject(options.company);
                var childRecord = getCompanyChildRecord(options, userInfo);
                return saveCompanyChildRecord(company, childRecord, options, userInfo)
            },
            getCompanyChildRecord: (options, userInfo) => {
                var company = twcCompany.get(options.company.id);
                company.copyFromObject(options.company);
                var childRecord = getCompanyChildRecord(options, userInfo);
                return twcCompanyUI.getCompanyChildRecord(company, childRecord, userInfo);
            },

            saveCompanyProfile(payload) {
                var submitInfo = {};
                submitInfo[twcCompany.Type] = { id: payload.id, fields: [], values: [] };
                for (var k in payload) {
                    if (k == 'id') { continue; }
                    submitInfo[twcCompany.Type].fields.push(k);
                    submitInfo[twcCompany.Type].values.push(payload[k])
                }
                
                recu.submit(twcCompany.Type, payload.id, submitInfo[twcCompany.Type].fields, submitInfo[twcCompany.Type].values);

            }
        }
    });
