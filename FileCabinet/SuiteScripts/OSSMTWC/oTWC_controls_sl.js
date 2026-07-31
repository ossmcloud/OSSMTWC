/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope public
 *@NAmdConfig  /SuiteBundles/Bundle 548734/O/config.json
 */
define(['N/file', 'O/suitlet', '/.bundle/548734/O/core.js', '/.bundle/548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '/.bundle/548734/O/client/html.styles.js', './O/controls/oTWC_ui_ctrl.js', './O/oTWC_themes_ue.js', './oTWC_otop_test.js'],
    function (file, uis, core, coreSQL, recu, htmlStyles,  twcUI, twcThemesUE, otop) {
        var suiteLet = uis.new({ title: 'OSSM Control Page', script: 'SuiteScripts/OSSMTWC/oTWC_controls_cs.js' });
        suiteLet.get = (context, s) => {

            s.form.buttonAdd('Test', 'testFunction');
            s.form.buttonAdd('Delete all SRF', 'deleteAllSrf')

            twcThemesUE.setForm(s.form);

            var specialDates = {
                '2026-02-15': 'Hello, dude',
                '2026-03-11': 'Peppo onomastico',
                '2026-03-21': { title: 'spring', css: 'o-my-special-class' }
            }

            var datesContent = {
                '2026-02-15': 'Hello, dude',
                '2026-03-11': '<span style="color: magenta; font-size: 18px;">Peppo onomastico</span>',
                '2026-03-21': '<b>Spring</b>'
            }

            s.form.fieldHtml(otop.generateTOTP('M2U5UMB5OPRSDUIQFKGJNOS5WUOX57MX'))

            s.form.fieldHtml(twcUI.render({ type: twcUI.CTRL_TYPE.CALENDAR, id: 'twc-calendar', specialDates: specialDates, datesContent: datesContent }))
            s.form.fieldHtml(twcUI.render({ type: twcUI.CTRL_TYPE.CALENDAR, id: 'twc-calendar-2', specialDates: specialDates, minimal: true }))

        }

        return {
            onRequest: uis.onRequest
        }
    });
