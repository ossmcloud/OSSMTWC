/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['N/file', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/client/html.styles.js', './oTWC_themes.js'],
    (file, core, htmlStyles, twcThemes) => {

        function getTWCCss() {
            var css = file.load('SuiteScripts/OSSMTWC/ui/css/oTWC.css').getContents();
            return css.substring(css.indexOf('/* TRUNCATE */'));
        }


        function setForm(form) {
            var temp = form.fieldIdCount;
            try {
                form.fieldIdCount = 9999;
                form.fieldHtml(htmlStyles.all(''));
                var styles = twcThemes.css('default')
                styles += file.load('SuiteScripts/OSSMTWC/O/css/html.styles.css').getContents();
                styles += getTWCCss();
                styles += `
                    label {
                        display: inline;
                    }
                `
                form.fieldHtml(`<style>${styles}</style>`);    
            } catch (error) {
                // @@NOTE: an error can happen if we have more than one user event scripts running against same record and both add the styles  
                core.logDebug('THEMES-UE', error.message);
            } finally {
                form.fieldIdCount = temp;
            }
            
        }


        return {

            setForm: setForm
           
        }
    });
