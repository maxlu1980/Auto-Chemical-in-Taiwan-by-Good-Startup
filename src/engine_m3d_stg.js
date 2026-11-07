/* ===== [engine_m3d_stg.js] M3D / STG: the model and stage registries ===== */
function M3D(id) { return CRM3D[id] || (typeof WPM3D !== 'undefined' && WPM3D[id]) || null; }
function STG(id) { return (typeof WP_STAGES !== 'undefined' && WP_STAGES[id]) || CR_STAGES[id] || ['-']; } // the guide's own stage tables first: the reference engine's 'water' sample must not shadow the sealant guide's water channel

