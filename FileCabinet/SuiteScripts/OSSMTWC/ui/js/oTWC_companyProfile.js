/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_config.js', '../../data/oTWC_profile.js'],
    (core, coreSql, b64, twcPageBase, dialog, twcConfig, twcProfile) => {


        class TWCCompanyProfilePage extends twcPageBase.TWCPageBase {

            constructor() {
                super({ scriptId: 'otwc_companyprofile_sl' });


            }


            initPage() {
                this.ui.find('.twc-file').click(async e => {
                    var file = jQuery(e.currentTarget).data('file')
                    await this.previewFile(file, e)
                })

                this.ui.getControl(twcProfile.Type).onToolbarClick = e => {
                    if (e.action == 'add-new') {
                        this.manageProfile(null, e.table);
                    } else if (e.action == 'edit') {
                        this.manageProfile(e.rowData, e.table);
                    } else if (e.action == 'delete') {
                        dialog.confirm('Are you sure you wish to delete this record', () => {
                            e.rowData.delete = true;
                            this.manageProfile(e.rowData, e.table);
                        })
                    }
                }

                this.ui.getControl('upload-file').on('click', e => { this.uploadDocument(); })
            }

            uploadDocument() {
                try {

                    throw new Error('under development')

                } catch (error) {
                    dialog.error(error);
                }
            }

            manageProfile(profile, table) {
                try {

                    throw new Error('under development ' + (profile?.id || 'add new'))

                } catch (error) {
                    dialog.error(error);
                }
            }


        }

        return {

            init: function () {
                twcPageBase.init(new TWCCompanyProfilePage())
            }


        }
    });
