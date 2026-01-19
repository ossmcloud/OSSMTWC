/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define([],
    () => {

        var _themes = [
            {
                name: 'dark',
                vars: [
                    { name: '--nav-icon-color', value: 'orange' },
                    { name: '--grid-color', value: 'rgb(107,107,107)' },
                    { name: '--dash-grid-color', value: 'rgb(107,107,107)' },
                    { name: '--main-color', value: 'white' },
                    { name: '--main-bkgd-color', value: 'rgb(67,67,67)' },
                    { name: '--input-color', value: 'white' },
                    { name: '--input-color-disabled', value: 'silver' },
                    { name: '--input-bkgd-color', value: 'black' },
                    { name: '--input-bkgd-color-disabled', value: 'black' },
                    { name: '--label-color', value: 'silver' },
                    { name: '--title-color', value: 'orange' },
                    { name: '--accent-fore-color', value: 'orange' },
                    { name: '--accent-color', value: 'white' },
                    { name: '--accent-bkgd-color', value: 'rgba(0, 0, 0, 1)' },
                    { name: '--highlight-color', value: 'white' },
                    { name: '--highlight-color-bkgd', value: 'orange' },
                    { name: '--highlight-color-border', value: 'blue' },
                    { name: '--highlight-color-2', value: 'maroon' },
                    { name: '--highlight-color-2-bkgd', value: 'yellow' },
                    { name: '--hover-bkgd-color', value: 'rgb(117, 117, 117)' },
                    { name: '--back-panel-gradient', value: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(67,67,67,1) 85%, rgb(97, 97, 97) 100%)' },
                    { name: '--bkgd-color-1', value: 'black' },
                    { name: '--bkgd-color-2', value: 'rgba(67,67,67,0.5)' },
                    { name: '--bkgd-color-3', value: 'rgb(67,67,67)' },
                ]
            },
            {
                name: 'mars',
                vars: [
                    { name: '--nav-icon-color', value: 'yellow' },
                    { name: '--grid-color', value: 'rgb(180, 120, 1)' },
                    { name: '--dash-grid-color', value: 'rgba(180, 120, 1, 0.25)' },
                    { name: '--main-color', value: 'rgb(217,217,217)' },
                    { name: '--main-bkgd-color', value: 'rgb(86, 67, 44)' },
                    { name: '--input-color', value: 'white' },
                    { name: '--input-color-disabled', value: 'gray' },
                    { name: '--input-bkgd-color', value: 'black' },
                    { name: '--input-bkgd-color-disabled', value: 'black' },
                    { name: '--label-color', value: 'silver' },
                    { name: '--title-color', value: 'orange' },
                    { name: '--accent-fore-color', value: 'yellow' },
                    { name: '--accent-color', value: 'white' },
                    { name: '--accent-bkgd-color', value: 'rgb(238, 131, 0)' },
                    { name: '--highlight-color', value: 'white' },
                    { name: '--highlight-color-bkgd', value: 'orange' },
                    { name: '--highlight-color-border', value: 'blue' },
                    { name: '--highlight-color-2', value: 'maroon' },
                    { name: '--highlight-color-2-bkgd', value: 'yellow' },
                    { name: '--hover-bkgd-color', value: 'rgb(162, 97, 27)' },
                    { name: '--back-panel-gradient', value: 'linear-gradient(180deg, rgba(71, 35, 9, 1) 0%, rgba(115,57,15,1) 85%, rgb(135, 67, 18) 100%)' },
                    { name: '--bkgd-color-1', value: 'black' },
                    { name: '--bkgd-color-2', value: 'rgba(67,67,67,0.5)' },
                    { name: '--bkgd-color-3', value: 'rgb(67,67,67)' },
                ]
            },
            {
                name: 'forest',
                vars: [
                    { name: '--nav-icon-color', value: 'orange' },
                    { name: '--grid-color', value: 'rgb(155, 195, 155)' },
                    { name: '--dash-grid-color', value: 'rgba(155, 195, 155, 0.25)' },
                    { name: '--main-color', value: 'rgb(0,77,0)' },
                    { name: '--main-bkgd-color', value: 'rgb(227, 247, 227)' },
                    { name: '--label-color', value: 'green' },
                    { name: '--input-color', value: 'white' },
                    { name: '--input-color-disabled', value: 'silver' },
                    { name: '--input-bkgd-color', value: 'rgb(0, 195, 155)' },
                    { name: '--input-bkgd-color-disabled', value: 'rgb(137, 157, 137)' },
                    { name: '--title-color', value: 'rgb(0, 77, 0)' },
                    { name: '--accent-fore-color', value: 'orange' },
                    { name: '--accent-color', value: 'white' },
                    { name: '--accent-bkgd-color', value: 'rgb(0, 77, 0)' },
                    { name: '--highlight-color', value: 'white' },
                    { name: '--highlight-color-bkgd', value: 'rgb(50, 168, 82)' },
                    { name: '--highlight-color-border', value: 'rgb(195, 255, 0)' },
                    { name: '--highlight-color-2', value: 'maroon' },
                    { name: '--highlight-color-2-bkgd', value: 'yellow' },
                    { name: '--hover-bkgd-color', value: 'rgb(187, 207, 187)' },
                    { name: '--back-panel-gradient', value: 'linear-gradient(180deg, rgba(165, 185, 165, 1) 0%, rgba(33, 147, 33,1) 85%, rgb(0, 137, 0) 100%)' },
                    { name: '--bkgd-color-1', value: 'rgba(0, 155, 0, 0.1)' },
                    { name: '--bkgd-color-2', value: 'rgba(0, 155, 0, 0.1)' },
                    { name: '--bkgd-color-3', value: 'rgba(0, 155, 0, 0.1)' },
                ]
            },
            {
                name: 'ocean',
                vars: [
                    { name: '--nav-icon-color', value: 'orangered' },
                    { name: '--grid-color', value: 'rgb(73, 112, 135)' },
                    { name: '--dash-grid-color', value: 'rgba(73, 112, 135, 0.25)' },
                    { name: '--main-color', value: 'rgb(0,0,77)' },
                    { name: '--main-bkgd-color', value: 'rgb(227,227,247)' },
                    { name: '--label-color', value: 'blue' },
                    { name: '--input-color-disabled', value: 'silver' },
                    { name: '--input-color', value: 'rgb(0,0,77)' },
                    { name: '--input-bkgd-color', value: 'rgb(184, 184, 255)' },
                    { name: '--input-bkgd-color-disabled', value: 'rgb(167, 167, 201)' },
                    { name: '--title-color', value: 'rgb(0, 0, 77)' },
                    { name: '--accent-fore-color', value: 'rgb(0, 150, 255)' },
                    { name: '--accent-color', value: 'white' },
                    { name: '--accent-bkgd-color', value: 'rgb(0, 0, 77)' },
                    { name: '--highlight-color', value: 'white' },
                    { name: '--highlight-color-bkgd', value: 'blue' },
                    { name: '--highlight-color-border', value: 'rgb(0, 187, 255)' },
                    { name: '--highlight-color-2', value: 'maroon' },
                    { name: '--highlight-color-2-bkgd', value: 'yellow' },
                    { name: '--hover-bkgd-color', value: 'rgb(187, 187, 207)' },
                    { name: '--back-panel-gradient', value: 'linear-gradient(180deg, rgba(165, 165, 185, 1) 0%, rgba(33, 33, 147,1) 85%, rgb(0, 0, 137) 100%)' },
                    { name: '--bkgd-color-1', value: 'rgba(184, 184, 255, 0.1)' },
                    { name: '--bkgd-color-2', value: 'rgba(184, 184, 255, 0.2)' },
                    { name: '--bkgd-color-3', value: 'rgba(184, 184, 255, 0.4)' },
                ]
            },
            {
                name: 'default',
                vars: [
                    { name: '--nav-icon-color', value: 'orange' },
                    { name: '--grid-color', value: 'rgb(155,155,175)' },
                    { name: '--dash-grid-color', value: 'rgb(240, 240, 240)' },
                    { name: '--main-color', value: 'black' },
                    { name: '--main-bkgd-color', value: 'white' },
                    { name: '--label-color', value: 'rgb(155,155,175)' },
                    { name: '--input-color', value: 'black' },
                    { name: '--input-color-disabled', value: 'gray' },
                    { name: '--input-bkgd-color', value: 'whitesmoke' },
                    { name: '--input-bkgd-color-disabled', value: 'rgb(227, 227, 227)' },
                    { name: '--title-color', value: 'rgb(39, 57, 107)' },
                    { name: '--accent-fore-color', value: 'orange' },
                    { name: '--accent-color', value: 'white' },
                    { name: '--accent-bkgd-color', value: 'rgba(75, 86, 117, 1)' },
                    { name: '--highlight-color', value: 'white' },
                    { name: '--highlight-color-bkgd', value: 'blue' },
                    { name: '--highlight-color-border', value: 'rgb(0, 187, 255)' },
                    { name: '--highlight-color-2', value: 'maroon' },
                    { name: '--highlight-color-2-bkgd', value: 'yellow' },
                    { name: '--hover-bkgd-color', value: 'rgb(225, 225, 247)' },
                    { name: '--back-panel-gradient', value: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(177, 177, 177, .25) 85%, rgb(177, 177, 177) 100%)' },
                    { name: '--bkgd-color-1', value: 'white' },
                    { name: '--bkgd-color-2', value: 'rgba(197,197,197,0.25)' },
                    { name: '--bkgd-color-3', value: 'rgba(197,197,197,0.25)' },
                ]
            },

        ]


        function css(theme, fontSize, gridBorder) {

            if (theme && theme.constructor.name == 'Object') {
                fontSize = theme.fontSize;
                gridBorder = theme.gridBorder;
                theme = theme.theme;
            }

            var fontSizeHeader = parseInt((fontSize || '14px').replace('px', '')) * .85;
            //var t = corej.array.find(_themes, 'name', theme);
            var t = _themes.find(th => { return th.name == theme; })
            if (!t) { t = _themes[_themes.length - 1]; }
            var css = ':root {';
            for (var tx = 0; tx < t.vars.length; tx++) {
                var v = t.vars[tx];
                css += `    ${v.name}: ${v.value};\n`
            }
            css += `    --font-size: ${fontSize || '14px'};\n`;
            css += `    --font-header-size: ${fontSizeHeader}px;\n`;
            css += `    --grid-border: ${gridBorder || '1px'};\n`;
            css += '}';
            return css;
        }

        function js() {
            var js = 'setTheme = (theme) => {';
            for (var tx = 0; tx < _themes.length; tx++) {
                var t = _themes[tx];
                if (tx == _themes.length - 1) {
                    js += '} else {\n'
                } else {
                    if (tx > 0) { js += ' } else '; }
                    js += `if (theme == '${t.name}') {\n`
                }
                for (var vx = 0; vx < t.vars.length; vx++) {
                    var v = t.vars[vx];
                    js += `    document.documentElement.style.setProperty('${v.name}', '${v.value}');\n`
                }
            }
            js += '}\n'
            js += '}\n'
            js += `
                setFontSize = (fontSize) => {
                    var fontSizeHeader = parseInt((fontSize || '14px').replace('px', '')) * .85;
                    document.documentElement.style.setProperty('--font-size', fontSize);
                    document.documentElement.style.setProperty('--font-header-size', fontSizeHeader + 'px');
                }
            `;
            js += `
                setGridBorder = (gridBorder) => {
                    document.documentElement.style.setProperty('--grid-border', gridBorder);
                }
            `;
            return js;
        }

        function get() {
            var names = ['default'];
            for (var tx = 0; tx < _themes.length - 1; tx++) {
                names.push(_themes[tx].name);
            }
            return names;
        }


        return {
            get: get,
            css: css,
            js: js
        }
    });
