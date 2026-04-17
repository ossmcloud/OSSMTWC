/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
define(['SuiteBundles/Bundle 548734/O/core.js', 'SuiteBundles/Bundle 548734/O/core.sql.js', './persistent/oTWC_profilePersistent.js', './oTWC_utils.js'],
    (core, coreSQL, twcProfile, twcUtils) => {

        // @@TODO: @@REVIEW: I cannot use the function from twcUtils as there is recursive reference and the variable twcUtils is actually null
        function fromJsToNs(nsDate) {
            if (!nsDate) { return nsDate; }
            var dateParts = nsDate.split('-');
            if (dateParts.length != 3) { return 'Invalid Date'; }
            var d = parseInt(dateParts[2], 10);
            var m = parseInt(dateParts[1], 10);
            return `${d}/${m}/${dateParts[0]}`;
        }

        class OSSMTWC_Profile extends twcProfile.PersistentRecord {
            constructor(id, staticLoad) {
                super(id, staticLoad);
            }
        }


        return {
            Type: twcProfile.Type,
            Fields: twcProfile.Fields,
            FieldsInfo: twcProfile.FieldsInfo,

            get: function (id) {
                var rec = new OSSMTWC_Profile(id);
                rec.load();

                if (rec.state == 'new') {
                    rec.accreditationStatus = twcUtils.ProfileAccreditationStatus.Pending;
                    rec.accreditationSubmitted = new Date();
                }

                return rec;
            },

            select: function (options) {
                var rec = new OSSMTWC_Profile();
                return rec.select(options);
            },

            getFields: () => {
                return twcUtils.getFields(twcProfile.Type);
            },

            // @@TODO: @@REVIEW: this should not use hardcoded names
            getAccreditationStatusHtml(status) {
                if (!status) { return ''; }
                var backgroundColor = 'silver'; var color = 'white';

                if (status == 'Inactive') {
                    color = 'var(--main-color)';
                    backgroundColor = 'transparent';
                } else if (status == 'Accredited') {
                    color = 'white';
                    backgroundColor = 'green';
                } else if (status == 'SPExpired') {
                    color = 'white';
                    backgroundColor = 'red';
                } else if (status == 'Pending') {
                    color = 'white';
                    backgroundColor = 'orange';
                }

                return `
                    <span class="twc-record-status-row" style="color: ${color}; background-color: ${backgroundColor};" >
                        ${status}
                    </span>
                `;
            },

            // @@TODO: @@REVIEW: this should not use hardcoded names
            getCertStatusHtml(status, exDate) {
                if (!status) { return ''; }
                var backgroundColor = 'silver'; var color = 'white';

                if (status == 'No') {
                    color = 'var(--main-color)';
                    backgroundColor = 'transparent';
                } else if (status == 'Active') {
                    color = 'white';
                    backgroundColor = 'green';
                } else if (status == 'Expired') {
                    color = 'white';
                    backgroundColor = 'red';
                } else if (status == 'Pending') {
                    color = 'white';
                    backgroundColor = 'orange';
                }

                if (exDate) { exDate = fromJsToNs(exDate); }

                return `
                    <span class="twc-record-status-row" style="color: ${color}; background-color: ${backgroundColor};" >
                        ${exDate || status}
                    </span>
                `;
            },

            getDateStatusHtml(date, today) {
                if (!date) { return ''; }
                var backgroundColor = 'green'; var color = 'white';
                if (date < today) {
                    backgroundColor = 'red';
                }
                return `
                    <span class="twc-record-status-row" style="color: ${color}; background-color: ${backgroundColor};" >
                        ${fromJsToNs(date)}
                    </span>
                `;
            }

        }
    });
