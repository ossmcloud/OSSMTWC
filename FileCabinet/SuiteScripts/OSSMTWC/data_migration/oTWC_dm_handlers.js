/**
 * @NApiVersion 2.1
 * @NModuleScope public
 */
// @@NOTE: Radix data migration: registry of the import handlers (one per import type, SPEC_v1.1 §6); add SRF / SAF here when built
define(['./oTWC_dm_equipment.js'],
    (dmEquipment) => {

        const HANDLERS = [dmEquipment];

        function get(type) {
            var handler = HANDLERS.find(h => { return h.type == type; });
            if (!handler) { throw new Error(`Unknown import type: ${type}`); }
            return handler;
        }

        return {
            list: () => { return HANDLERS; },
            get: get
        }
    });
