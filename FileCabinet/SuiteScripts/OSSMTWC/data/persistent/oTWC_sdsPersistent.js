/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_sds';
        var _recordFields = {
            NAME: 'name',
            SRF: 'custrecord_twc_sds_srf',
            SITE: 'custrecord_twc_sds_site',
            CUSTOMER: 'custrecord_twc_sds_cust',
            STATUS: 'custrecord_twc_sds_status',
            COMMENCMENT_DATE: 'custrecord_twc_sds_comm_date',
            DRAWING: 'custrecord_twc_sds_drawing',
            DRAWING_REFERENCE: 'custrecord_twc_sds_drawing_ref',
            INCLUDE_LICENSE_MAP: 'custrecord_twc_sds_include_map',
            ADDITIONAL_SRF_CONIDITONS: 'custrecord_twc_sds_add_cond',
            POWER_SUPPLY_COMMENTS: 'custrecord_twc_sds_power_supply_notes',
            FIBRE_RIGHTS: 'custrecord_twc_sds_fibre_rights',
            FIBRE_DUCT_ROUTE: 'custrecord_twc_sds_fibre_drawing',
            FIBRE_DUCT_ROUTE_REFERENCE: 'custrecord_twc_sds_fibre_drawing_ref',
            FIBRE_PROVIDER: 'custrecord_twc_sds_fibre_provider',
            FIBRE_OTHER_PROVIDER: 'custrecord_twc_sds_fibre_provider_other',
            FIBRE_NOTES: 'custrecord_twc_sds_fibre_notes',
            PREVIOUS_LICENSE_FEE: 'custrecord_twc_sds_fee_prev',
            FEE_REDUCTION: 'custrecord_twc_sds_fee_reduction',
            FEE_UPLIFT: 'custrecord_twc_sds_fee_uplift',
            NEW_LICENSE_FEE: 'custrecord_twc_sds_fee_new',
            FEE_CHARGE_BREAK_DOWN: 'custrecord_twc_sds_fee_charge_breackdown',
            AGREEMENT_TEMPLATE: 'custrecord_twc_sds_agr_tmpl',
            SITE_TYPE: 'custrecord_twc_sds_site_type',
            ACCESS_DRAWING: 'custrecord_twc_sds_drawing_access',
            ACCESS_DRAWING_REFERENCE: 'custrecord_twc_sds_drawing_access_ref',
            FIBRE_DRAWING: 'custrecord_twc_sds_drawing_fibre',
            FIBRE_DRAWING_REFERENCE: 'custrecord_twc_sds_drawing_fibre_ref',
            PDF: 'custrecord_twc_sds_pdf',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SRF: { name: 'custrecord_twc_sds_srf', type: 'select', alias: 'sRF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_srf' },
            SITE: { name: 'custrecord_twc_sds_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            CUSTOMER: { name: 'custrecord_twc_sds_cust', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            STATUS: { name: 'custrecord_twc_sds_status', type: 'select', alias: 'status', display: 'normal', mandatory: false, recordType: 'customrecord_twc_sds_status' },
            COMMENCMENT_DATE: { name: 'custrecord_twc_sds_comm_date', type: 'date', alias: 'commencmentDate', display: 'normal', mandatory: false },
            DRAWING: { name: 'custrecord_twc_sds_drawing', type: 'select', alias: 'drawing', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file' },
            DRAWING_REFERENCE: { name: 'custrecord_twc_sds_drawing_ref', type: 'text', alias: 'drawingReference', display: 'normal', mandatory: false },
            INCLUDE_LICENSE_MAP: { name: 'custrecord_twc_sds_include_map', type: 'checkbox', alias: 'includeLicenseMap', display: 'normal', mandatory: false },
            ADDITIONAL_SRF_CONIDITONS: { name: 'custrecord_twc_sds_add_cond', type: 'text', alias: 'additionalSRFConiditons', display: 'normal', mandatory: false },
            POWER_SUPPLY_COMMENTS: { name: 'custrecord_twc_sds_power_supply_notes', type: 'text', alias: 'powerSupplyComments', display: 'normal', mandatory: false },
            FIBRE_RIGHTS: { name: 'custrecord_twc_sds_fibre_rights', type: 'checkbox', alias: 'fibreRights', display: 'normal', mandatory: false },
            FIBRE_DUCT_ROUTE: { name: 'custrecord_twc_sds_fibre_drawing', type: 'select', alias: 'fibreDuctRoute', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file' },
            FIBRE_DUCT_ROUTE_REFERENCE: { name: 'custrecord_twc_sds_fibre_drawing_ref', type: 'text', alias: 'fibreDuctRouteReference', display: 'normal', mandatory: false },
            FIBRE_PROVIDER: { name: 'custrecord_twc_sds_fibre_provider', type: 'select', alias: 'fibreProvider', display: 'normal', mandatory: false, recordType: 'customrecord_twc_infra_fibre_svc_provide' },
            FIBRE_OTHER_PROVIDER: { name: 'custrecord_twc_sds_fibre_provider_other', type: 'text', alias: 'fibreOtherProvider', display: 'normal', mandatory: false },
            FIBRE_NOTES: { name: 'custrecord_twc_sds_fibre_notes', type: 'text', alias: 'fibreNotes', display: 'normal', mandatory: false },
            PREVIOUS_LICENSE_FEE: { name: 'custrecord_twc_sds_fee_prev', type: 'float', alias: 'previousLicenseFee', display: 'normal', mandatory: false },
            FEE_REDUCTION: { name: 'custrecord_twc_sds_fee_reduction', type: 'float', alias: 'feeReduction', display: 'normal', mandatory: false },
            FEE_UPLIFT: { name: 'custrecord_twc_sds_fee_uplift', type: 'float', alias: 'feeUplift', display: 'normal', mandatory: false },
            NEW_LICENSE_FEE: { name: 'custrecord_twc_sds_fee_new', type: 'float', alias: 'newLicenseFee', display: 'normal', mandatory: false },
            FEE_CHARGE_BREAK_DOWN: { name: 'custrecord_twc_sds_fee_charge_breackdown', type: 'text', alias: 'feeChargeBreakDown', display: 'normal', mandatory: false },
            AGREEMENT_TEMPLATE: { name: 'custrecord_twc_sds_agr_tmpl', type: 'select', alias: 'agreementTemplate', display: 'normal', mandatory: false, recordType: 'customrecord_twc_sds_agr_tmpl' },
            SITE_TYPE: { name: 'custrecord_twc_sds_site_type', type: 'select', alias: 'siteType', display: 'normal', mandatory: false, recordType: 'customrecord_twc_sds_site_type' },
            ACCESS_DRAWING: { name: 'custrecord_twc_sds_drawing_access', type: 'select', alias: 'accessDrawing', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file' },
            ACCESS_DRAWING_REFERENCE: { name: 'custrecord_twc_sds_drawing_access_ref', type: 'text', alias: 'accessDrawingReference', display: 'normal', mandatory: false },
            FIBRE_DRAWING: { name: 'custrecord_twc_sds_drawing_fibre', type: 'select', alias: 'fibreDrawing', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file' },
            FIBRE_DRAWING_REFERENCE: { name: 'custrecord_twc_sds_drawing_fibre_ref', type: 'text', alias: 'fibreDrawingReference', display: 'normal', mandatory: false },
            PDF: { name: 'custrecord_twc_sds_pdf', type: 'select', alias: 'pDF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_file' },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_SDS extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get sRF() {
                return this.get(_recordFields.SRF);
            } set sRF(value) {
                this.set(_recordFields.SRF, value)
            }
            get sRFName() { return this.getText(_recordFields.SRF); }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get customer() {
                return this.get(_recordFields.CUSTOMER);
            } set customer(value) {
                this.set(_recordFields.CUSTOMER, value)
            }
            get customerName() { return this.getText(_recordFields.CUSTOMER); }
            
            get status() {
                return this.get(_recordFields.STATUS);
            } set status(value) {
                this.set(_recordFields.STATUS, value)
            }
            get statusName() { return this.getText(_recordFields.STATUS); }
            
            get commencmentDate() {
                return this.get(_recordFields.COMMENCMENT_DATE);
            } set commencmentDate(value) {
                this.set(_recordFields.COMMENCMENT_DATE, value)
            }
            
            get drawing() {
                return this.get(_recordFields.DRAWING);
            } set drawing(value) {
                this.set(_recordFields.DRAWING, value)
            }
            get drawingName() { return this.getText(_recordFields.DRAWING); }
            
            get drawingReference() {
                return this.get(_recordFields.DRAWING_REFERENCE);
            } set drawingReference(value) {
                this.set(_recordFields.DRAWING_REFERENCE, value)
            }
            
            get includeLicenseMap() {
                return this.get(_recordFields.INCLUDE_LICENSE_MAP);
            } set includeLicenseMap(value) {
                this.set(_recordFields.INCLUDE_LICENSE_MAP, value)
            }
            
            get additionalSRFConiditons() {
                return this.get(_recordFields.ADDITIONAL_SRF_CONIDITONS);
            } set additionalSRFConiditons(value) {
                this.set(_recordFields.ADDITIONAL_SRF_CONIDITONS, value)
            }
            
            get powerSupplyComments() {
                return this.get(_recordFields.POWER_SUPPLY_COMMENTS);
            } set powerSupplyComments(value) {
                this.set(_recordFields.POWER_SUPPLY_COMMENTS, value)
            }
            
            get fibreRights() {
                return this.get(_recordFields.FIBRE_RIGHTS);
            } set fibreRights(value) {
                this.set(_recordFields.FIBRE_RIGHTS, value)
            }
            
            get fibreDuctRoute() {
                return this.get(_recordFields.FIBRE_DUCT_ROUTE);
            } set fibreDuctRoute(value) {
                this.set(_recordFields.FIBRE_DUCT_ROUTE, value)
            }
            get fibreDuctRouteName() { return this.getText(_recordFields.FIBRE_DUCT_ROUTE); }
            
            get fibreDuctRouteReference() {
                return this.get(_recordFields.FIBRE_DUCT_ROUTE_REFERENCE);
            } set fibreDuctRouteReference(value) {
                this.set(_recordFields.FIBRE_DUCT_ROUTE_REFERENCE, value)
            }
            
            get fibreProvider() {
                return this.get(_recordFields.FIBRE_PROVIDER);
            } set fibreProvider(value) {
                this.set(_recordFields.FIBRE_PROVIDER, value)
            }
            get fibreProviderName() { return this.getText(_recordFields.FIBRE_PROVIDER); }
            
            get fibreOtherProvider() {
                return this.get(_recordFields.FIBRE_OTHER_PROVIDER);
            } set fibreOtherProvider(value) {
                this.set(_recordFields.FIBRE_OTHER_PROVIDER, value)
            }
            
            get fibreNotes() {
                return this.get(_recordFields.FIBRE_NOTES);
            } set fibreNotes(value) {
                this.set(_recordFields.FIBRE_NOTES, value)
            }
            
            get previousLicenseFee() {
                return this.get(_recordFields.PREVIOUS_LICENSE_FEE);
            } set previousLicenseFee(value) {
                this.set(_recordFields.PREVIOUS_LICENSE_FEE, value)
            }
            
            get feeReduction() {
                return this.get(_recordFields.FEE_REDUCTION);
            } set feeReduction(value) {
                this.set(_recordFields.FEE_REDUCTION, value)
            }
            
            get feeUplift() {
                return this.get(_recordFields.FEE_UPLIFT);
            } set feeUplift(value) {
                this.set(_recordFields.FEE_UPLIFT, value)
            }
            
            get newLicenseFee() {
                return this.get(_recordFields.NEW_LICENSE_FEE);
            } set newLicenseFee(value) {
                this.set(_recordFields.NEW_LICENSE_FEE, value)
            }
            
            get feeChargeBreakDown() {
                return this.get(_recordFields.FEE_CHARGE_BREAK_DOWN);
            } set feeChargeBreakDown(value) {
                this.set(_recordFields.FEE_CHARGE_BREAK_DOWN, value)
            }
            
            get agreementTemplate() {
                return this.get(_recordFields.AGREEMENT_TEMPLATE);
            } set agreementTemplate(value) {
                this.set(_recordFields.AGREEMENT_TEMPLATE, value)
            }
            get agreementTemplateName() { return this.getText(_recordFields.AGREEMENT_TEMPLATE); }
            
            get siteType() {
                return this.get(_recordFields.SITE_TYPE);
            } set siteType(value) {
                this.set(_recordFields.SITE_TYPE, value)
            }
            get siteTypeName() { return this.getText(_recordFields.SITE_TYPE); }
            
            get accessDrawing() {
                return this.get(_recordFields.ACCESS_DRAWING);
            } set accessDrawing(value) {
                this.set(_recordFields.ACCESS_DRAWING, value)
            }
            get accessDrawingName() { return this.getText(_recordFields.ACCESS_DRAWING); }
            
            get accessDrawingReference() {
                return this.get(_recordFields.ACCESS_DRAWING_REFERENCE);
            } set accessDrawingReference(value) {
                this.set(_recordFields.ACCESS_DRAWING_REFERENCE, value)
            }
            
            get fibreDrawing() {
                return this.get(_recordFields.FIBRE_DRAWING);
            } set fibreDrawing(value) {
                this.set(_recordFields.FIBRE_DRAWING, value)
            }
            get fibreDrawingName() { return this.getText(_recordFields.FIBRE_DRAWING); }
            
            get fibreDrawingReference() {
                return this.get(_recordFields.FIBRE_DRAWING_REFERENCE);
            } set fibreDrawingReference(value) {
                this.set(_recordFields.FIBRE_DRAWING_REFERENCE, value)
            }
            
            get pDF() {
                return this.get(_recordFields.PDF);
            } set pDF(value) {
                this.set(_recordFields.PDF, value)
            }
            get pDFName() { return this.getText(_recordFields.PDF); }
            
            get created() {
                return this.get(_recordFields.CREATED);
            } set created(value) {
                this.set(_recordFields.CREATED, value)
            }
            
            get last_modified() {
                return this.get(_recordFields.MODIFIED);
            } set last_modified(value) {
                this.set(_recordFields.MODIFIED, value)
            }
            
            get created_by() {
                return this.get(_recordFields.OWNER);
            } set created_by(value) {
                this.set(_recordFields.OWNER, value)
            }
            
            get last_modified_by() {
                return this.get(_recordFields.MODIFIED_BY);
            } set last_modified_by(value) {
                this.set(_recordFields.MODIFIED_BY, value)
            }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_SDS,

            get: function (id) {
                var rec = new OSSMTWC_SDS(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SDS();
                return rec.select(options);
            }

        }
    });
