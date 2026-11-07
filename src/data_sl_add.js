/* ===== [data_sl_add.js] ===== */
/* ===== Sealant guide: labels of the substructure and the bond breaker (merged into SLT) ===== */
(function () {
  var A = {
    zh: { hat: '帽型接縫條（鍍鋅鋼接縫條）', bbTape: '重貼 bond breaker（接縫條頂面）', memb: '透濕防水膜', cav: '通氣層：橫檔 18 mm', bb: '二面接著：背襯材／bond breaker，深度 ≤ 寬度' },
    en: { hat: 'Hat joiner (galvanised steel)', bbTape: 'Bond breaker re-stuck on the joiner', memb: 'Breathable membrane', cav: 'Ventilation cavity: 18 mm furring', bb: 'Two-sided adhesion: backer rod / bond breaker, depth ≤ width' },
    ja: { hat: 'ハットジョイナー（溶融亜鉛めっき）', bbTape: 'ボンドブレーカー貼り直し（ジョイナー天面）', memb: '透湿防水シート', cav: '通気層：胴縁 18 mm', bb: '二面接着：バックアップ材／ボンドブレーカー、深さ ≤ 幅' }
  };
  ['zh', 'en', 'ja'].forEach(function (l) { var LB = SLT[l]['sl.lb'], k; for (k in A[l]) LB[k] = A[l][k]; });
})();


