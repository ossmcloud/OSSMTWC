/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './oTWC_pageBase.js', '../../O/oTWC_dialogEx.js', '../../data/oTWC_config.js'],
    (core, coreSql, twcPageBase, dialog, twcConfig) => {


        class TWCNexusRecordPage extends twcPageBase.TWCPageBase {
            #changes = {};
            constructor() {
                super({ scriptId: 'otwc_nexusrecord_sl' });

            }

            initPage() {

                if (this.data.type===undefined) {
                    this.ui.find('div[data-record-type]').on('click', e => {
                        var t = jQuery(e.currentTarget).data('record-type');
                        location.href = this.url({ nxType: t });
                    })
                }

            }

            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    var payload = this.#changes;

                    await this.post({ action: 'save' }, payload);
                    this.dirty = false;
                    location.href = location.href.replace('&edit=T', '');

                } catch (error) {
                    await dialog.errorAsync(error);
                } finally {
                    this.waitClose();
                }

            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCNexusRecordPage())
            }


        }
    });
