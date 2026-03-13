/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../../O/data/oTWC_baseRecord.js'],
    (core, coreSQL, recu, customRec) => {
        var _recordType = 'customrecord_twc_saf_tm_blk';
        var _recordFields = {
            SAF: 'custrecord_twc_saf_tm_blk_saf',
            BLOCK_DATE: 'custrecord_twc_saf_tm_blk_date',
            BLOCK: 'custrecord_twc_saf_tm_blk_block',
        }
        var _recordFieldInfo = {
            SAF: { name: 'custrecord_twc_saf_tm_blk_saf', type: 'select', alias: 'sAF', display: 'normal', mandatory: false, recordType: 'customrecord_twc_saf,' },
            BLOCK_DATE: { name: 'custrecord_twc_saf_tm_blk_date', type: 'date', alias: 'blockDate', display: 'normal', mandatory: false },
            BLOCK: { name: 'custrecord_twc_saf_tm_blk_block', type: 'select', alias: 'block', display: 'normal', mandatory: false, recordType: 'customrecord_twc_tm_blk_opt,' },
        }

        class OSSMTWC_SAFTimeBlock extends customRec.RecordBase {
            constructor(id, staticLoad) {
                super(_recordType, _recordFieldInfo, id, staticLoad);
            }
            get sAF() {
                return this.get(_recordFields.SAF);
            } set sAF(value) {
                this.set(_recordFields.SAF, value)
            }
            get sAFName() { return this.getText(_recordFields.SAF); }
            
            get blockDate() {
                return this.get(_recordFields.BLOCK_DATE);
            } set blockDate(value) {
                this.set(_recordFields.BLOCK_DATE, value)
            }
            
            get block() {
                return this.get(_recordFields.BLOCK);
            } set block(value) {
                this.set(_recordFields.BLOCK, value)
            }
            get blockName() { return this.getText(_recordFields.BLOCK); }
            
        }

        return {
            Type: _recordType,
            Fields: _recordFields,
            FieldsInfo: _recordFieldInfo,
            PersistentRecord: OSSMTWC_SAFTimeBlock,

            get: function (id) {
                var rec = new OSSMTWC_SAFTimeBlock(id);
                rec.load();
                return rec;
            }, 

            select: function (options) {
                var rec = new OSSMTWC_SAFTimeBlock();
                return rec.select(options);
            }

        }
    });
