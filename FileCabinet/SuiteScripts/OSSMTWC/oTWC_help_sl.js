/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

// @@NOTE: Nexus user help: serves the static help pages in ./help (html + help.css + nav.js) from NetSuite
//         - ?page=<name>.html selects the page (default index.html); only lower-case "name.html" files are served (REVIEW_NOTES.md etc. never are)
//         - help.css and nav.js are inlined, links between pages are rewritten to this Suitelet (?page=...)
//         - staff pages (STAFF_PAGES) are only served to employees, and nav.js hides them from everyone else
define(['N/file', 'N/url', 'N/runtime', 'SuiteBundles/Bundle 548734/O/core.js', './data/oTWC_config.js'],
    (file, url, runtime, core, twcConfig) => {

        const HELP_FOLDER = './help/';
        const DEFAULT_PAGE = 'index.html';
        // @@IMPORTANT: keep in step with the 'staff' flags in help/nav.js
        const STAFF_PAGES = ['srf-workflow.html', 'staff-netsuite.html'];

        const loadHelpFile = (name) => {
            return file.load({ id: HELP_FOLDER + name }).getContents();
        };

        const isEmployee = () => {
            try {
                return twcConfig.userInfo()?.isEmployee === true;
            } catch (error) {
                // @@NOTE: users not set up (no profile / company) can still read the help, as non-employees
                return false;
            }
        };

        const htmlEncode = (value) => {
            return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };

        const renderPage = (pageName, baseUrl, employee) => {
            var html = loadHelpFile(pageName);
            var css = loadHelpFile('help.css');
            var navJs = loadHelpFile('nav.js');

            // @@NOTE: help.css and nav.js inlined: the File Cabinet urls of the help folder are not reachable by Customer Center users
            html = html.replace('<link rel="stylesheet" href="help.css">', () => `<style>\r\n${css}\r\n</style>`);
            var navSetup = `window.NX_HELP = { base: ${JSON.stringify(baseUrl)}, page: ${JSON.stringify(pageName)}, staff: ${employee ? 'true' : 'false'} };`;
            html = html.replace('<script src="nav.js"></script>', () => `<script>\r\n${navSetup}\r\n${navJs}\r\n</script>`);

            // @@NOTE: links to other help pages (href="page.html" or "page.html#anchor") go through this Suitelet
            html = html.replace(/href="([a-z0-9-]+\.html)(#[\w-]+)?"/g, (match, page, anchor) => {
                return `href="${htmlEncode(baseUrl + '&page=' + page)}${anchor || ''}"`;
            });
            return html;
        };

        const renderMessage = (title, message, baseUrl) => {
            return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Nexus Help</title></head>
                <body style="font-family: Segoe UI, Arial, sans-serif; padding: 32px;">
                    <h2>${htmlEncode(title)}</h2><p>${htmlEncode(message)}</p>
                    <p><a href="${htmlEncode(baseUrl + '&page=' + DEFAULT_PAGE)}">Back to the Nexus help</a></p>
                </body></html>`;
        };

        const onRequest = (context) => {
            var script = runtime.getCurrentScript();
            var baseUrl = url.resolveScript({ scriptId: script.id, deploymentId: script.deploymentId });
            try {
                var pageName = String(context.request.parameters.page || DEFAULT_PAGE).toLowerCase();
                // @@IMPORTANT: whitelist the page name, it is used to build a File Cabinet path
                if (!/^[a-z0-9-]+\.html$/.test(pageName)) { pageName = DEFAULT_PAGE; }

                var employee = isEmployee();
                if (!employee && STAFF_PAGES.indexOf(pageName) >= 0) {
                    context.response.write(renderMessage('Towercom staff only', 'This help page is only available to Towercom staff.', baseUrl));
                    return;
                }

                var html = null;
                try {
                    html = renderPage(pageName, baseUrl, employee);
                } catch (error) {
                    if (pageName == DEFAULT_PAGE) { throw error; }
                    core.logError('NEXUS-HELP', `page not found: ${pageName} - ${error.message}`);
                    context.response.write(renderMessage('Page not found', `The help page "${pageName}" does not exist.`, baseUrl));
                    return;
                }
                context.response.write(html);
            } catch (error) {
                core.logError('NEXUS-HELP', error.message);
                context.response.write(renderMessage('Nexus Help', `The help could not be loaded: ${error.message}`, baseUrl));
            }
        };

        return {
            onRequest
        };

    });
