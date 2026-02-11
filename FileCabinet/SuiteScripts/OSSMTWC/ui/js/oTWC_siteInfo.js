/**
 * @NApiVersion 2.1
 * @NModuleScope public
 * @NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/core.base64.js', './oTWC_pageBase.js', '../../data/oTWC_config.js', '../../data/oTWC_icons.js', '../../data/oTWC_site.js', '../../O/oTWC_dialogEx.js', './oTWC_siteInfoPanel.js'],
    (core, coreSql, b64, twcPageBase, twcConfig, twcIcons, twcSite, dialog, twcSiteInfoPanel) => {



        class TWCSiteInfoPage extends twcPageBase.TWCPageBase {
            #changes = {};
            #sitePanel = null;
            constructor() {
                super({ scriptId: 'otwc_siteInfo_sl' });


            }
          
            initPage() {

                this.#sitePanel = twcSiteInfoPanel.get({ page: this, data: window.twc.page.data.siteInfo.site });

                this.ui.on('change', e => {
                    if (e.id.startsWith('twc-navigation')) { return; }
                    this.#changes[e.id] = e.value;
                    console.log(this.#changes)
                    this.dirty = true
                })

                this.ui.on('click', e => {
                    console.log(e)
                    if (e.id == 'site-directions') {
                        // @@TODO: this is just a sample, remove later
                        window.open(`https://www.google.com/maps?q=${this.ui.getControl(twcSite.Fields.LATITUDE).value},${this.ui.getControl(twcSite.Fields.LONGITUDE).value}`);

                    }
                })

                core.array.each(this.ui.controls, c => {
                    if (c.type != 'table') { return; }
                    c.onToolbarClick = (action, tbl) => {
                        if (action == 'add-new') {
                            alert(' add new record ??? ')
                            return false;
                        }
                    }
                })

            }

            async onSave() {
                try {
                    this.wait();

                    if (!this.dirty) { throw new Error('The record has not changed'); }

                    var payload = this.#changes;
                    payload.id = window.twc.page.data.siteInfo.site.id;

                    await this.post({ action: 'save' }, payload);
                    this.dirty = false;
                    location.href = location.href.replace('&edit=T', '');

                } catch (error) {
                    await dialog.errorAsync(error);
                } finally {
                    this.waitClose();
                }

            }


            test() {
                dialog.iconPicker()
            }

        }

        return {

            init: function () {
                twcPageBase.init(new TWCSiteInfoPage())
            }


        }
    });
