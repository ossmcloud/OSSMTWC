/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */

define(['N/render', 'N/file', 'N/encode', 'SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../ui/modules/oTWC_siteRequestUtils.js', '../modules/oTWC_sdsEngine.js', '../data/oTWC_config.js', '../data/oTWC_sds.js', '../data/oTWC_file.js', '../data/oTWC_utils.js', '../O/oTWC_nsFileUtils.js'],
    (render, file, encode, core, recu, twcSiteRequestUtils, twcSdsEngine, twcConfig, twcSDS, twcFile, twcUtils, nsFileUtils) => {

        function getDrawings(requestedJson) {
            var embeddedPds = '';

            const embedPdf = (drawings) => {
                core.array.each(drawings, drawing => {
                    embeddedPds += formatEmbedPdf(drawing.file_id);
                })
            }

            embedPdf(twcSdsEngine.getSrfDrawingFiles(requestedJson.srf.id, requestedJson.sds[twcSDS.Fields.DRAWING] || 0));
            embedPdf(twcSdsEngine.getSiteLicenseMapFiles(requestedJson.siteDetails.id, requestedJson.srf.company_id));
            embedPdf(twcSdsEngine.getSiteAccessFiles(requestedJson.siteDetails.id));

            return embeddedPds;
            
        }

        // @@NOTE: XML-escape every text value sent to the SDS template (a '&' or '<' in a description / address / note would break the PDF)
        //         values that intentionally hold markup are left as they are:
        //              status      : spaces replaced with <br /> (oTWC_sdsEngine.js: getSrfInfo)
        //              logo        : url (already &amp; encoded)
        //              sdsCondition_N.conditions[].description : condition text from the agreement condition records, may contain <b> set by the client
        const NO_ESCAPE_KEYS = ['status', 'logo'];
        function escapeXml(v) {
            return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
        }
        function escapeForTemplate(obj, inCondition) {
            if (Array.isArray(obj)) {
                core.array.each(obj, (o, idx) => {
                    if (typeof o == 'string') { obj[idx] = escapeXml(o); } else if (o && typeof o == 'object') { escapeForTemplate(o, inCondition); }
                });
                return obj;
            }
            for (var k in obj) {
                var v = obj[k];
                if (v === null || v === undefined) { continue; }
                if (typeof v == 'string') {
                    if (NO_ESCAPE_KEYS.indexOf(k) >= 0) { continue; }
                    if (inCondition && k == 'description') { continue; }
                    obj[k] = escapeXml(v);
                } else if (typeof v == 'object') {
                    escapeForTemplate(v, inCondition || k.startsWith('sdsCondition_'));
                }
            }
            return obj;
        }

        function formatFee(value) {
            if (value === null || value === undefined || value === '' || value === 'null') { return ''; }
            var n = parseFloat(value);
            if (isNaN(n)) { return value; }
            var parts = Math.abs(n).toFixed(2).split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return `${n < 0 ? '-' : ''}${parts[0]}.${parts[1]}`;
        }

        // @@NOTE: image types BFO can render, mapped to the data uri mime type (N/file fileType values)
        const EMBED_IMAGE_TYPES = {
            JPGIMAGE: 'image/jpeg',
            PJPGIMAGE: 'image/jpeg',
            PNGIMAGE: 'image/png',
            GIFIMAGE: 'image/gif',
            BMPIMAGE: 'image/bmp',
            TIFFIMAGE: 'image/tiff',
        }

        // @@NOTE: A4 in points and page padding used for the image pages
        const PAGE_A4 = { w: 595, h: 842, padding: 20 };

        // @@NOTE: reads width / height from the header of a PNG or JPEG (base64 content), null if not found (other types or unexpected header)
        //         only the first ~64KB are decoded, the JPEG size marker (SOF) is normally well within that
        function getImageSize(base64, mime) {
            try {
                var head = encode.convert({ string: base64.substring(0, 87384), inputEncoding: encode.Encoding.BASE_64, outputEncoding: encode.Encoding.HEX });
                const byteAt = (i) => { return parseInt(head.substr(i * 2, 2), 16); };
                const word = (i) => { return (byteAt(i) << 8) + byteAt(i + 1); };
                const bytes = head.length / 2;

                if (mime == 'image/png') {
                    // PNG signature (8 bytes) + IHDR length/type (8 bytes) then width (4 bytes) and height (4 bytes)
                    if (head.substr(0, 16).toLowerCase() != '89504e470d0a1a0a') { return null; }
                    return { w: (word(16) << 16) + word(18), h: (word(20) << 16) + word(22) };
                }

                if (mime == 'image/jpeg') {
                    if (byteAt(0) != 0xFF || byteAt(1) != 0xD8) { return null; }
                    var i = 2;
                    while (i + 9 < bytes) {
                        if (byteAt(i) != 0xFF) { i++; continue; }
                        var marker = byteAt(i + 1);
                        // SOF0..SOF15 except DHT (C4), JPG (C8) and DAC (CC): segment = length (2), precision (1), height (2), width (2)
                        if (marker >= 0xC0 && marker <= 0xCF && marker != 0xC4 && marker != 0xC8 && marker != 0xCC) {
                            return { w: word(i + 7), h: word(i + 5) };
                        }
                        // markers without a length
                        if (marker == 0xD8 || marker == 0x01 || (marker >= 0xD0 && marker <= 0xD7) || marker == 0xFF) { i += (marker == 0xFF) ? 1 : 2; continue; }
                        i += 2 + word(i + 2);
                    }
                }
            } catch (e) {
                core.logDebug('SDS-IMAGE-SIZE', e.message);
            }
            return null;
        }

        // @@NOTE: an image is embedded as a page of its own (one <pdf> in the <pdfset>), scaled to fit the page
        //         landscape when the image is wider than tall (or the size cannot be read: drawings are generally landscape)
        function formatEmbedImage(base64, mime) {
            var size = getImageSize(base64, mime);
            var landscape = !size || size.w >= size.h;
            var pageW = (landscape ? PAGE_A4.h : PAGE_A4.w) - PAGE_A4.padding * 2;
            var pageH = (landscape ? PAGE_A4.w : PAGE_A4.h) - PAGE_A4.padding * 2;

            var imgW = pageW; var imgH = pageH;
            if (size && size.w > 0 && size.h > 0) {
                var scale = Math.min(pageW / size.w, pageH / size.h);
                imgW = Math.floor(size.w * scale);
                imgH = Math.floor(size.h * scale);
            }

            return `
                <pdf>
                    <body size="${landscape ? 'A4-landscape' : 'A4'}" padding="${PAGE_A4.padding}pt">
                        <img src="data:${mime};base64,${base64}" width="${imgW}pt" height="${imgH}pt" />
                    </body>
                </pdf>
            `;
        }

        // @@NOTE: drawings / licence maps / access documents can be PDFs or images (e.g. TL Drawing uploaded as a JPG)
        //         a PDF is embedded as it is, an image as a page with the image, any other type is skipped (logged) so it does not break the whole SDS
        function formatEmbedPdf(fileId) {
            var f = file.load(fileId);
            var fileType = (f.fileType || '').toString().toUpperCase();

            if (fileType == 'PDF') {
                return `<pdf src="data:application/pdf;base64,${f.getContents()}"></pdf>`
            }

            var mime = EMBED_IMAGE_TYPES[fileType];
            if (mime) {
                return formatEmbedImage(f.getContents(), mime);
            }

            core.logError('SDS-EMBED-FILE', `File ${fileId} (${f.name}) not embedded in the SDS: unsupported file type ${fileType}`);
            return '';
        }

        function renderSDS(context, recId, setStatus) {
            var userInfo = twcConfig.userInfo(context);

            const requestJSON = twcSdsEngine.getSrfInfo(recId);

            requestJSON.sds = twcSdsEngine.getFormData({ id: recId });
            var dateParts = requestJSON.sds.custrecord_twc_sds_comm_date.split('-');
            requestJSON.sds.custrecord_twc_sds_comm_date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            // @@NOTE: licence fees printed as currency: thousands separator and 2 decimals (e.g. 1,234.50), empty if not set
            core.array.each(['custrecord_twc_sds_fee_prev', 'custrecord_twc_sds_fee_reduction', 'custrecord_twc_sds_fee_uplift', 'custrecord_twc_sds_fee_new'], f => {
                requestJSON.sds[f] = formatFee(requestJSON.sds[f]);
            });


            requestJSON.logo = 'https://9061443-sb1.app.netsuite.com/core/media/media.nl?id=2&amp;c=9061443_SB1&amp;h=DLBF3L9Uup0gbcrPVFiqDAl_MlZywyZdMJO0rzYfa6EtDJn6';
            if (core.env.live()) { requestJSON.logo = 'https://9061443.app.netsuite.com/core/media/media.nl?id=2&amp;c=9061443&amp;h=DLBF3L9Uup0gbcrPVFiqDAl_MlZywyZdMJO0rzYfa6EtDJn6'; }

            // @@NOTE: the attached drawings / access docs are read below from ids, escaping only affects the text printed by the template
            //         names used for the pdf file / folder are kept raw (taken before escaping)
            const sdsName = requestJSON.sds[twcSDS.Fields.NAME];
            const sdsFolder = `${twcUtils.ROOT_FILE_FOLDER}/Sites/${requestJSON.siteDetails.site_id}/SDS/${requestJSON.srf.name}`;
            escapeForTemplate(requestJSON);

            const xmlFile = file.load({ id: 'SuiteScripts/OSSMTWC/XML/oTwc_print_SDS.xml' });
            var xmlString = xmlFile.getContents();

            xmlString = xmlString.replace(`<pdf src=""></pdf>`, getDrawings(requestJSON))
            //throw new Error(xmlString)

            const renderer = render.create();
            renderer.templateContent = xmlString;
            renderer.addCustomDataSource({ format: render.DataSource.OBJECT, alias: 'requestJSON', data: requestJSON });
            const pdfFile = renderer.renderAsPdf();
            pdfFile.name = `${sdsName}.pdf`;

            var fType = twcSdsEngine.getSDSFileType();
            var f = twcFile.get(requestJSON.sds[twcSDS.Fields.PDF]);

            if (!f.id) {
                // @@NOTE: if the PDF does not exist we create it at the 1st print
                // @@TODO: should this go to site folder or company folder ?????
                pdfFile.folder = nsFileUtils.createFolderIfNotExist(sdsFolder);

                f.file = pdfFile.save();
                f.name = sdsName;
                f.recordType = twcSDS.Type;
                f.recordID = requestJSON.sds.id;
                if (fType) {
                    f.r_type = fType.value;
                    f.status = twcUtils.FileStatus.Pending;
                }
                f.uploadedBy = userInfo.profile;
                f.save();

                recu.submit(twcSDS.Type, requestJSON.sds.id, twcSDS.Fields.PDF, f.id);

            } else {
                // @@NOTE: if the file already exists we re-save it if is still draft or if we need to set the status
                //          the setStatus flag is true when the SDS is executed by TL
                if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Draft || setStatus) {
                    // @@TODO: should this go to site folder or company folder ?????
                    pdfFile.folder = nsFileUtils.createFolderIfNotExist(sdsFolder);
                    f.file = pdfFile.save();
                    if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Draft) {
                        f.status = twcUtils.FileStatus.Pending;
                    } else if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Current) {
                        f.status = twcUtils.FileStatus.Approved;
                    } else if (requestJSON.sds[twcSDS.Fields.STATUS] == twcUtils.SdsStatus.Superseded) {
                        f.status = twcUtils.FileStatus.Superseded;
                    }
                    f.save();
                }

            }

            return pdfFile;
        }


        return {
            renderSDS: renderSDS
        }

    });
