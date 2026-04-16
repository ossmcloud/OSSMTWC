/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope public
 */
define(['N/currentRecord', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js'],
    (currentRecord, core, recu) => {
        function pageInit(context) {
            console.log('MS debug ========================>')
            window.ossm = new MSFields();
        }

        class MSFields {
            #fields = [];
            constructor() {
                jQuery('.ossm-ms-field-container').each((idx, ele) => {
                    this.#fields.push(new MSField(jQuery(ele)));
                });

               
            }
        }
        class MSField {
            #id = null;
            #fieldId = null;
            #ui = null;
            #data = null;
            #values = null;
            constructor(ui) {

                this.#ui = ui;
                this.#id = ui.attr('id').replace('_ms_fix', '');

                var pageData = JSON.parse(ui.find(`#${this.#id}_ms_data`).html());

                this.#data = pageData.dataSource;
                this.#fieldId = pageData.field;
                this.#values = ui.find('.ossm-ms-field');
                this.initEvents();

            }

            initEvents() {
                this.#values.find('.ossm-ms-value>span').click(e => {
                    jQuery(e.currentTarget).parent().remove();
                    this.setValue();
                })
                this.#ui.find('.ossm-ms-value-add').click(e => {
                    this.editValues();
                })
            }

            getValues() {
                var values = [];
                this.#values.find('.ossm-ms-value').each((idx, ele) => {
                    values.push(jQuery(ele).data('id'));
                })
                return values;
            }

            setValue() {
                currentRecord.get().setValue(this.#fieldId, this.getValues())
            }

            setValues(values) {
                var selectedValues = '<span class="ossm-ms-value-add">+</span>';
                for (var vx = 0; vx < values.length; vx++) {
                    var d = this.#data.find(i => { return i.id == values[vx]; })
                    selectedValues += `
                        <span data-id="${d.id}" class="ossm-ms-value">
                            ${d.name}
                            <span>x</span>
                        </span>
                    `
                }
                this.#values.html(selectedValues);
                this.initEvents();
                this.setValue();
            }


            editValues() {
                var dialog = jQuery(`
                    <dialog class="ossm-ms-dlg">
                        <div class="ossm-ms-dlg-title"></div>
                        <div id="ossm-ms-dlg-content"></div>
                        <div class="ossm-ms-dlg-footer">
                            <input type="button" value="Cancel" />    
                            <input type="button" value="Ok" />
                        </div>
                    </dialog>
                `);

                var content = jQuery('<div class="ossm-ms-dlg-content"></div>');
                var leftPane = jQuery(`<div style="width: 50%"></div>`);
                var rightPane = jQuery(`<div style="width: 50%"></div>`);
                content.append(leftPane);
                content.append(rightPane);
                dialog.find('#ossm-ms-dlg-content').html(content);
                jQuery('body').append(dialog);

                var values = this.getValues();

                var populateLists = (values) => {
                    rightPane.html(`<div>selected values</div>`);
                    leftPane.html(`<div><input type="text" placeholder="type to search" style="width: 100%" /></div>`);
                    for (var dx = 0; dx < this.#data.length; dx++) {
                        var data = this.#data[dx];
                        if (values.indexOf(data.id) < 0) {
                            leftPane.append(`<div class="ossm-ms-data" data-id="${data.id}"><span>+</span> ${data.name}</div>`)
                        } else {
                            rightPane.append(`<div class="ossm-ms-data-selected" data-id="${data.id}"><span>x</span> ${data.name}</div>`)
                        }
                    }


                    rightPane.find('div>span').click(e => {
                        var item = jQuery(e.currentTarget).parent();
                        var vx = values.indexOf(item.data('id'));
                        values.splice(vx, 1);
                        populateLists(values);
                    })

                    leftPane.find('div>span').click(e => {
                        var item = jQuery(e.currentTarget).parent();
                        values.push(item.data('id'))
                        populateLists(values);
                    })

                    leftPane.find('input[type="text"]').on('input', e => {
                        var src = jQuery(e.currentTarget).val().trim().toLowerCase();
                        if (src) {
                            leftPane.find('.ossm-ms-data').each((idx, ele) => {
                                var divRow = jQuery(ele);
                                if (divRow.text().trim().toLowerCase().indexOf(src) >= 0) {
                                    divRow.css('display', 'block');
                                } else {
                                    divRow.css('display', 'none');
                                }
                            });
                        } else {
                            leftPane.find('.ossm-ms-data').css('display', 'block');
                        }
                    })
                }
                populateLists(values)


                dialog.find('input[type="button"]').click(e => {
                    if (jQuery(e.currentTarget).val() == 'Ok') {
                        var values = [];
                        rightPane.find('div').each((idx, ele) => {
                            if (!jQuery(ele).data('id')) { return; }
                            values.push(jQuery(ele).data('id'));
                        })
                        this.setValues(values);
                    }
                    dialog[0].close();
                    dialog.remove();
                });

                dialog[0].showModal();

                if (this.#data.length > 20) {
                    dialog.css('height', '70vh');
                }

            }

        }


     

        return {
            pageInit: pageInit,
     
        }
    });
