/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js' ],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_pwr_usr';
        var _recordFields = {
            NAME: 'name',
            SITE: 'custrecord_twc_pwr_usr_site',
            POWER_SUPPLY: 'custrecord_twc_pwr_usr_pwr_supply',
            CUSTOMER: 'custrecord_twc_pwr_usr_customer',
            CUSTOMER_SITE_REFERENCE: 'custrecord_twc_pwr_usr_cust_site_ref',
            POWER_LOAD_KW: 'custrecord_twc_pwr_usr_load_kw',
            POWER_BILLABLE: 'custrecord_twc_pwr_usr_pwr_billable',
            USAGE_BILLED_TO: 'custrecord_twc_pwr_usr_usage_billed_to',
            COMMENT: 'custrecord_twc_pwr_usr_comment',
            POWER_METER: 'custrecord_twc_pwr_usr_meter',
            POWER_USER_ID: 'custrecord_twc_pwr_usr_id',
            CREATED: 'created',
            MODIFIED: 'lastmodified',
            OWNER: 'owner',
            MODIFIED_BY: 'lastmodifiedby',
        }
        var _recordFieldInfo = {
            NAME: { name: 'name', type: 'text', alias: 'name', display: 'normal', mandatory: true },
            SITE: { name: 'custrecord_twc_pwr_usr_site', type: 'select', alias: 'site', display: 'normal', mandatory: false, recordType: 'customrecord_twc_site' },
            POWER_SUPPLY: { name: 'custrecord_twc_pwr_usr_pwr_supply', type: 'select', alias: 'powerSupply', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_sply' },
            CUSTOMER: { name: 'custrecord_twc_pwr_usr_customer', type: 'select', alias: 'customer', display: 'normal', mandatory: false, recordType: 'customrecord_twc_company' },
            CUSTOMER_SITE_REFERENCE: { name: 'custrecord_twc_pwr_usr_cust_site_ref', type: 'text', alias: 'customerSiteReference', display: 'normal', mandatory: false },
            POWER_LOAD_KW: { name: 'custrecord_twc_pwr_usr_load_kw', type: 'float', alias: 'powerLoadkW', display: 'normal', mandatory: false },
            POWER_BILLABLE: { name: 'custrecord_twc_pwr_usr_pwr_billable', type: 'checkbox', alias: 'powerBillable', display: 'normal', mandatory: false },
            USAGE_BILLED_TO: { name: 'custrecord_twc_pwr_usr_usage_billed_to', type: 'date', alias: 'usageBilledTo', display: 'normal', mandatory: false },
            COMMENT: { name: 'custrecord_twc_pwr_usr_comment', type: 'text', alias: 'comment', display: 'normal', mandatory: false },
            POWER_METER: { name: 'custrecord_twc_pwr_usr_meter', type: 'select', alias: 'powerMeter', display: 'normal', mandatory: false, recordType: 'customrecord_twc_pwr_mtr' },
            POWER_USER_ID: { name: 'custrecord_twc_pwr_usr_id', type: 'text', alias: 'powerUserID', display: 'normal', mandatory: false },
            CREATED: { name: 'created', type: 'datetimetz', alias: 'created', display: 'inline', }, 
            MODIFIED: { name: 'lastmodified', type: 'datetimetz', alias: 'last_modified', display: 'inline', }, 
            OWNER: { name: 'owner', type: 'select', alias: 'created_by', display: 'inline', recordType: 'employee'}, 
            MODIFIED_BY: { name: 'lastmodifiedby', type: 'select', alias: 'last_modified_by', display: 'inline', recordType: 'employee'}, 
        }

        class OSSMTWC_PowerUser extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get name() {
                return this.get('name');
            } set name(value) {
                this.set('name', value)
            }
            
            get site() {
                return this.get(_recordFields.SITE);
            } set site(value) {
                this.set(_recordFields.SITE, value)
            }
            get siteName() { return this.getText(_recordFields.SITE); }
            
            get powerSupply() {
                return this.get(_recordFields.POWER_SUPPLY);
            } set powerSupply(value) {
                this.set(_recordFields.POWER_SUPPLY, value)
            }
            get powerSupplyName() { return this.getText(_recordFields.POWER_SUPPLY); }
            
            get customer() {
                return this.get(_recordFields.CUSTOMER);
            } set customer(value) {
                this.set(_recordFields.CUSTOMER, value)
            }
            get customerName() { return this.getText(_recordFields.CUSTOMER); }
            
            get customerSiteReference() {
                return this.get(_recordFields.CUSTOMER_SITE_REFERENCE);
            } set customerSiteReference(value) {
                this.set(_recordFields.CUSTOMER_SITE_REFERENCE, value)
            }
            
            get powerLoadkW() {
                return this.get(_recordFields.POWER_LOAD_KW);
            } set powerLoadkW(value) {
                this.set(_recordFields.POWER_LOAD_KW, value)
            }
            
            get powerBillable() {
                return this.get(_recordFields.POWER_BILLABLE);
            } set powerBillable(value) {
                this.set(_recordFields.POWER_BILLABLE, value)
            }
            
            get usageBilledTo() {
                return this.get(_recordFields.USAGE_BILLED_TO);
            } set usageBilledTo(value) {
                this.set(_recordFields.USAGE_BILLED_TO, value)
            }
            
            get comment() {
                return this.get(_recordFields.COMMENT);
            } set comment(value) {
                this.set(_recordFields.COMMENT, value)
            }
            
            get powerMeter() {
                return this.get(_recordFields.POWER_METER);
            } set powerMeter(value) {
                this.set(_recordFields.POWER_METER, value)
            }
            get powerMeterName() { return this.getText(_recordFields.POWER_METER); }
            
            get powerUserID() {
                return this.get(_recordFields.POWER_USER_ID);
            } set powerUserID(value) {
                this.set(_recordFields.POWER_USER_ID, value)
            }
            
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
            PersistentRecord: OSSMTWC_PowerUser,

            get: function (id) {
                var rec = new OSSMTWC_PowerUser(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_PowerUser();
                return rec.select(options);
            }

        }
    });
