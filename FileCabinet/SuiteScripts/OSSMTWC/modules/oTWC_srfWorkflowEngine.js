/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', 'SuiteBundles/Bundle 548734/O/data/rec.utils.js', '../data/oTWC_profile.js', '../data/oTWC_company.js', '../data/oTWC_utils.js', '../data/oTWC_srfWorkflow.js', '../data/oTWC_srfWorkflowItem.js', '../data/oTWC_srfWorkflowStage.js', '../data/oTWC_srf.js'],
    function (core, coreSql, recu, twcProfile, twcCompany, twcUtils, twcSrfWorkflow, twcSrfWorkflowItem, twcSrfWorkflowStage, twcSrf) {

        // @@HARDCODED
        const WORKFLOW_STATUS = {
            NEW: 1,
            IN_PROGRESS: 2,
            COMPLETED: 3,
            CANCELLED: 4
        }

        function initWorkFlow(options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            // @@NOTE: this function creates the initial work flow so it can only be run once against an SRF
            if (coreSql.first(`select id from ${twcSrfWorkflow.Type} where ${twcSrfWorkflow.Fields.SRF} = ${options.srf}`) != null) {
                throw new Error(`There is already a workflow set up for this SRF`);
            }

            // @@NOTE: get SRF and make sure status is Submitted
            var srf = twcSrf.get(options.srf);
            if (srf.state == 'new') { throw new Error(`No SRF Found for id: ${options.srf}`); }
            if (srf.sRFStatus != twcUtils.SrfStatus.Draft) { throw new Error(`Invalid SRF Status: ${srf.sRFStatusName}`); }

            // now load the stages to create the workflow
            var srfWorkflowStages = twcSrfWorkflowStage.select({ orderBy: [twcSrfWorkflowStage.Fields.STEP_NUMBER, twcSrfWorkflowStage.Fields.SEQUENCE_NUMBER] });

            var srfWorkflow = twcSrfWorkflow.get();
            srfWorkflow.sRF = options.srf;
            srfWorkflow.name = `W${srf.name}`;
            srfWorkflow.status = WORKFLOW_STATUS.NEW;
            srfWorkflow.save();

            core.array.each(srfWorkflowStages, (stage, idx) => {
                var srfWorkflowItem = twcSrfWorkflowItem.get();
                srfWorkflowItem.name = `W${srf.name}_S${stage.stepNumber}/${stage.sequenceNumber}`;
                srfWorkflowItem.workflow = srfWorkflow.id;
                srfWorkflowItem.workflowStage = stage.id;
                if (idx == 0) {
                    srfWorkflowItem.customerProfile = options.profile;
                    srfWorkflowItem.actual = new Date();
                    srfWorkflowItem.status = WORKFLOW_STATUS.COMPLETED;
                } else {
                    srfWorkflowItem.status = WORKFLOW_STATUS.NEW;
                }
                srfWorkflowItem.save();
            })

            recu.submit(twcSrf.Type, options.srf, twcSrf.Fields.SRF_STATUS, twcUtils.SrfStatus.Submitted);

        }

        function deleteWorkflow(options) {
            if (!options) { throw new Error('no parameters passed'); }
            if (!options.srf) { throw new Error('invalid parameters passed'); }

            options.id = coreSql.first(`select id from ${twcSrfWorkflow.Type} where ${twcSrfWorkflow.Fields.SRF} = ${options.srf}`).id;

            coreSql.each(`select id from ${twcSrfWorkflowItem.Type} where ${twcSrfWorkflowItem.Fields.WORKFLOW} = ${options.id}`, wi => {
                recu.del(twcSrfWorkflowItem.Type, wi.id);
            });
            recu.del(twcSrfWorkflow.Type, options.id);

            recu.submit(twcSrf.Type, options.srf, twcSrf.Fields.SRF_STATUS, twcUtils.SrfStatus.Draft);
        }

        function getStatusStyles(status, isItem) {
            var styles = { color: 'white', bkgd: 'silver' };
            if (status == WORKFLOW_STATUS.NEW) {
                if (isItem) {
                    styles.bkgd = 'rgb(220, 220, 220)';
                    styles.color = 'black';
                } else {
                    styles.bkgd = 'yellow';
                    styles.color = 'maroon';
                }
            } else if (status == WORKFLOW_STATUS.IN_PROGRESS) {
                styles.bkgd = 'blue';
            } else if (status == WORKFLOW_STATUS.COMPLETED) {
                styles.bkgd = 'green';
            } else if (status == WORKFLOW_STATUS.CANCELLED) {
                styles.bkgd = 'red';
            }
            return `color: ${styles.color}; background-color: ${styles.bkgd}`;
        }

        return {
            WorkflowStatus: WORKFLOW_STATUS,
            deleteWorkflow: deleteWorkflow,
            initWorkFlow: initWorkFlow,
            getItemStatusStyles: (status) => { return getStatusStyles(status, true) },
            getStatusStyles: getStatusStyles
        }
    });
