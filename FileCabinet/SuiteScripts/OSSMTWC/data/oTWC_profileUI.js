/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_utils.js', './oTWC_configUIFields.js', './oTWC_profile.js'],
    (runtime, core, coreSQL, twcUtils, configUIFields, twcProfile) => {




        function getProfileInfoPanels(dataSource, userInfo) {
            dataSource.Type = twcProfile.Type;
            var fieldGroups = [];
            fieldGroups.push(getProfileInfoPanels_mainInfo(dataSource, userInfo));
            fieldGroups.push(getProfileInfoPanels_certs(dataSource, userInfo));

            return fieldGroups;

        }

        function getProfileInfoPanels_mainInfo(dataSource, userInfo) {
            var fieldGroup = { id: 'profile-info', collapsed: false, renderAsTable: { width: '100%', 'table-layout': 'fixed' }, controls: [] };

            var basicInfo = { id: 'profile-info-basic', title: 'Basic Information', fields: [] };
            fieldGroup.controls.push(basicInfo);
            basicInfo.fields.push({ id: twcProfile.Fields.NAME, label: 'Name', width: '250px' })
            basicInfo.fields.push({ id: twcProfile.Fields.POSITION, label: 'Position', width: '250px' })
            basicInfo.fields.push({ id: twcProfile.Fields.POSITION, label: 'Experience', width: '250px', lineBreak: true })
            basicInfo.fields.push({ id: twcProfile.Fields.ENSUP_CARD, label: 'ENSUP Card', width: '250px' })
            basicInfo.fields.push({ id: twcProfile.Fields.E_MAIL, label: 'Email', width: '250px' })
            basicInfo.fields.push({ id: twcProfile.Fields.PHONE, label: 'Phone', lineBreak: true })
            basicInfo.fields.push({ id: twcProfile.Fields.COMMENTS, label: 'Comments', width: '100%' })

            var basicInfo2 = { id: 'profile-info-basic-2', title: 'Accreditation', fields: [] };
            fieldGroup.controls.push(basicInfo2);
            basicInfo2.fields.push({ id: twcProfile.Fields.ACCREDITATION_STATUS, label: 'Accreditation Status', width: '175px' })
            basicInfo2.fields.push({ id: twcProfile.Fields.ACCREDITATION_SUBMITTED, label: 'Submitted', width: '150px' })
            basicInfo2.fields.push({ id: twcProfile.Fields.ACCREDITATION_STATUS_CHANGE_DATE, label: 'Status Change Date', width: '150px' })
            basicInfo2.fields.push({ id: twcProfile.Fields.PICW_ACCEPTABLE, label: 'PICW' })
            basicInfo2.fields.push({ id: twcProfile.Fields.SAF_AVAILABLE, label: 'SAF' })
            basicInfo2.fields.push({ id: twcProfile.Fields.ATHLONE_APPROVED, label: 'Athlone', lineBreak: true })
            basicInfo2.fields.push({ id: twcProfile.Fields.ACCREDITATION_STATUS_COMMENT, label: 'Accreditation Comment', width: '100%', rows: 5 })

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }

        function getProfileInfoPanels_certs(dataSource, userInfo) {

            var fieldGroup = { id: 'profile-cert-1', collapsed: false, renderAsTable: { width: '100%', 'table-layout': 'fixed' }, controls: [] };
            //fieldGroup.controls.push(getProfileInfoPanels_safePass(userInfo));
            fieldGroup.controls.push(getProfileInfoPanels_cert(userInfo, dataSource, 'SAFE_PASS', 'SAFE_PASS', twcProfile.Fields.SAFE_PASS_STATUS, twcProfile.Fields.SAFE_PASS_EXPIRY, twcProfile.Fields.SAFE_PASS_FILENAME));
            fieldGroup.controls.push(getProfileInfoPanels_cert(userInfo, dataSource, 'CLIMBER', 'CLIMBER', twcProfile.Fields.CLIMBER_CERTIFIED_STATUS, twcProfile.Fields.CLIMBER_CERTIFIED_EXPIRY, twcProfile.Fields.CLIMBER_FILENAME));
            fieldGroup.controls.push(getProfileInfoPanels_cert(userInfo, dataSource, 'RESCUE', 'RESCUE', twcProfile.Fields.RESCUE_CERTIFIED_STATUS, twcProfile.Fields.RESCUE_CERTIFIED_EXPIRY, twcProfile.Fields.RESCUE_FILENAME));
            fieldGroup.controls.push(getProfileInfoPanels_cert(userInfo, dataSource, 'ROOFTOP', 'ROOFTOP', twcProfile.Fields.ROOFTOP_CERTIFIED_STATUS, twcProfile.Fields.ROOFTOP_CERTIFIED_EXPIRY, twcProfile.Fields.ROOFTOP_FILENAME));
            fieldGroup.controls.push(getProfileInfoPanels_cert(userInfo, dataSource, 'RF', 'RF', twcProfile.Fields.RF_CERTIFIED_STATUS, twcProfile.Fields.RF_CERTIFIED_EXPIRY, twcProfile.Fields.RF_FILENAME));
            fieldGroup.controls.push(getProfileInfoPanels_cert(userInfo, dataSource, 'DRONE', 'DRONE', twcProfile.Fields.DRONE_CERTIFIED_STATUS, twcProfile.Fields.DRONE_CERTIFIED_EXPIRY, twcProfile.Fields.DRONE_FILENAME));
            fieldGroup.controls.push(getProfileInfoPanels_cert(userInfo, dataSource, 'ELECTRICIAN', 'ELEC', twcProfile.Fields.ELECTRICIAN_CERTIFIED_STATUS, twcProfile.Fields.ELECTRICIAN_CERTIFIED_EXPIRY, twcProfile.Fields.ELECTRICIAN_FILENAME));
            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }

        // function getProfileInfoPanels_safePass(userInfo) {
        //     var nonTwcReadOnly = userInfo.isEmployee ? undefined : true;
        //     var certGroup = { id: 'profile-cart-safe-pass', title: 'SAFE-PASS', fields: [] };
        //     certGroup.fields.push({ id: twcProfile.Fields.SAFE_PASS_STATUS, label: 'Status', width: '100%', readOnly: nonTwcReadOnly, lineBreak: true })
        //     certGroup.fields.push({ id: twcProfile.Fields.SAFE_PASS_EXPIRY, label: 'Expiry', width: '100%', lineBreak: true })
        //     certGroup.fields.push({ id: twcProfile.Fields.SAFE_PASS_ID, label: 'Safe Pass ID', width: '100%', readOnly: nonTwcReadOnly, lineBreak: true })
        //     return certGroup;
        // }

        function getProfileInfoPanels_cert(userInfo, dataSource, title, certCode, fieldStatus, fieldExpiry, fieldFileName) {
            var fileId = dataSource.get(fieldFileName)
            var nonTwcReadOnly = userInfo.isEmployee ? undefined : true;
            var certGroup = { id: 'profile-cart-' + title.toLowerCase(), title: title, fields: [] };
            certGroup.fields.push({ id: fieldStatus, label: 'Status', width: '100%', readOnly: nonTwcReadOnly, lineBreak: true })
            certGroup.fields.push({ id: fieldExpiry, label: 'Expiry', width: '100%', lineBreak: true })
            certGroup.fields.push({ id: certCode.toLowerCase() + '_file_name', type: 'text', value: dataSource.getText(fieldFileName), label: 'File', width: '100%', readOnly: true, lineBreak: true })

            
            if (fileId) { certGroup.fields.push({ id: 'view-file-' + fileId, value: 'View File', styles: { width: 'calc(50% - 5px)', display: 'inline-block', 'margin-top': '3px' }, type: 'button' }) }
            certGroup.fields.push({ id: 'upload-file-' + certCode.toLowerCase(), value: 'Upload New', styles: { width: 'calc(50% - 5px)', display: 'inline-block', 'margin-top': '3px' }, type: 'button' })

            if (certCode == 'SAFE_PASS') {
                certGroup.fields.push({ id: twcProfile.Fields.SAFE_PASS_ID, label: 'Safe Pass ID', width: '100%', readOnly: nonTwcReadOnly, lineBreak: true })
            }

            
            certGroup.fields.push({ id: 'upload-file-input-' + certCode.toLowerCase(), type: 'file', accept: '.pdf', hide: true });

            return certGroup;
        }




        function getProfileInfoPanels_xxx(dataSource, userInfo) {
            var fieldGroup = { id: 'profile-xxx', title: 'XXX', collapsed: false, controls: [] };

            var basicInfo = { id: 'profile-xxx-a', title: 'Basic Information', fields: [] };
            fieldGroup.controls.push(basicInfo);
            basicInfo.fields.push({ id: twcProfile.Fields.NAME, label: 'Name' })

            configUIFields.formatPanelFields(dataSource, fieldGroup);
            return fieldGroup;
        }



        return {
            RecordType: twcProfile.Type,
            getUIFields: getProfileInfoPanels

        }
    });


