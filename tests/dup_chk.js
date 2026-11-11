/* (v88) the modules of one part share one closure. A function declared twice in the same scope is no error to the language: the later
   declaration silently replaces the earlier one everywhere, also for the calls written before it. v85 added a fxTick() (the settings of the
   two screen effects) to the closure that already had a fxTick(dt) (the tick of the fighting moves' light): from then on a strike's rings,
   arcs and beam were never faded nor taken away. This reads the built code with the build's own parser (terser) and names every function
   declared more than once in one scope, and every kept original of a wrapped function (var _nameXX = name) set twice under one name.
     node dup_chk.js [file]        exit 0: none · 1: duplicates · 2: the parser was not found */
var fs = require('fs'), path = require('path'), terser = null;
[function () { return require('terser'); }, function () { return require(path.join(process.cwd(), 'node_modules', 'terser')); }, function () { return require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'terser')); }].some(function (f) { try { terser = f(); return true; } catch (e) { return false; } });
if (!terser) { console.log('dup_chk: terser was not found (npm install terser): the check was not run'); process.exit(2); }
var file = process.argv[2] || [path.join(__dirname, '_build_check.js'), path.join(__dirname, '..', 'build', '_build_check.js')].filter(function (p) { return fs.existsSync(p); })[0], src = fs.readFileSync(file, 'utf8');
/* which module a line of the build belongs to (each begins with its own marker) */
var marks = []; src.split('\n').forEach(function (l, i) { var m = l.match(/^\/\* ===== \[([^\]]+)\]/); if (m) marks.push([i + 1, m[1]]); });
function where(n) { var ln = n.start ? n.start.line : 0, nm = '?'; for (var i = 0; i < marks.length && marks[i][0] <= ln; i++) nm = marks[i][1]; return nm + ' (line ' + ln + ' of the build)'; }
terser.minify(src, { parse: {}, compress: false, mangle: false, format: { ast: true, code: false } }).then(function (res) {
  if (res.error || !res.ast) { console.log('dup_chk: the build did not parse: ' + (res.error || 'no tree')); process.exit(1); }
  var LAMBDA = { Toplevel: 1, Defun: 1, Function: 1, Arrow: 1, Accessor: 1 }, stack = [], bad = [], scopes = 0, fns = 0;
  function close(S) { Object.keys(S.F).forEach(function (k) { if (S.F[k].length > 1) bad.push('function ' + k + ' is declared ' + S.F[k].length + ' times in one scope: ' + S.F[k].map(where).join(' · ')); }); Object.keys(S.V).forEach(function (k) { if (S.V[k].length > 1) bad.push('var ' + k + ' is set ' + S.V[k].length + ' times in one scope: ' + S.V[k].map(where).join(' · ')); }); }
  /* a block, an if, a try, a loop do not open a scope here: in a page's (sloppy) code their function declarations belong to the function round them */
  var visitor = { _visit: function (node, descend) { var T = node.TYPE, top = stack[stack.length - 1];
      if (T === 'Defun' && node.name && top) { fns++; (top.F['$' + node.name.name] = top.F['$' + node.name.name] || []).push(node); }
      if (T === 'VarDef' && top && node.value && node.name && node.name.TYPE === 'SymbolVar' && /^_/.test(node.name.name)) (top.V['$' + node.name.name] = top.V['$' + node.name.name] || []).push(node);
      var own = LAMBDA[T] === 1; if (own) { stack.push({ F: {}, V: {} }); scopes++; }
      if (descend) descend.call(node);
      if (own) close(stack.pop()); } };
  res.ast._walk(visitor);
  bad = bad.map(function (b) { return b.replace(/^(function|var) \$/, '$1 '); });
  console.log('dup_chk: ' + scopes + ' scopes, ' + fns + ' function declarations read');
  if (bad.length) { console.log('DUPLICATES ' + bad.length); bad.forEach(function (b) { console.log('  ' + b); }); process.exit(1); }
  console.log('dup_chk: no function is declared twice in one scope'); }).catch(function (e) { console.log('dup_chk: ' + (e && e.message || e)); process.exit(1); });
