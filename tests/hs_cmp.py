# (v89) two audit logs side by side, per guide: what the user had to do (turn the view in the survey, pick tools), what the work did (paused, stuck),
# how much the view moved while working
#   python3 hs_cmp.py <before.log[,more.log]> <after.log>
import sys, json, collections
def read(paths):
    R = collections.OrderedDict(); cur = None
    for path in paths.split(','):
        for l in open(path, encoding='utf-8'):
            l = l.strip()[9:]
            if l.startswith('== '): cur = l[3:]; R.setdefault(cur, []); continue
            if not cur or not (l.startswith('drive') or l.startswith('survey')): continue
            try: k, rest = l.split(' {', 1); d = json.loads('{' + rest)
            except Exception: continue
            if d.get('kind') == 'drive' and R[cur] and R[cur][-1].get('kind') == 'drive' and R[cur][-1].get('i') == d.get('i'): R[cur][-1] = d; continue   # a stuck phase logged twice
            R[cur].append(d)
    return R
def sums(R):
    G = collections.OrderedDict()
    for sc, L in R.items():
        g = G.setdefault(sc.split('_')[0], {'scn': 0, 'turnS': 0, 'taps': 0, 'drive': 0, 'swing': 0, 'off': 0, 'paused': 0.0, 'stuck': 0, 'picks': 0, 'move': 0.0})
        g['scn'] += 1
        for d in L:
            if d['kind'] == 'survey': g['turnS'] += d.get('userTurn', d.get('turnTotal', 0)) or 0; g['taps'] += d.get('taps', 0) or 0; continue
            g['drive'] += 1; g['swing'] += d['swing']; g['off'] += 1 if d['maxOff'] >= 1 else 0; g['paused'] += d.get('paused', 0) or 0; g['stuck'] += 1 if (d.get('stuck') or not d.get('done')) else 0; g['move'] += d['move']
            g['picks'] += len(d.get('tools') or [])
    return G
B = sums(read(sys.argv[1])); A = sums(read(sys.argv[2]))
print('%-4s %-28s %-28s' % ('', 'before', 'after')); T = {'b': [0, 0.0, 0, 0, 0], 'a': [0, 0.0, 0, 0, 0]}
for k in B:
    b, a = B[k], A.get(k, {})
    if not a: continue
    f = lambda g: 'survey turn %4d° taps %2d | picks %2d | stuck %2d | paused %5.1f s | off-screen %2d/%-2d | swing/step %3d° | moves %4.1f m' % (g['turnS'], g['taps'], g['picks'], g['stuck'], g['paused'], g['off'], g['drive'], g['swing'] / max(1, g['drive']), g['move'])
    print(k, '(%d scenarios)' % b['scn']); print('  before', f(b)); print('  after ', f(a))
    for key, g in (('b', b), ('a', a)): T[key][0] += g['stuck']; T[key][1] += g['paused']; T[key][2] += g['turnS']; T[key][3] += g['swing']; T[key][4] += g['drive']
print('all: before stuck %d, paused %.0f s, survey turn %d°, swing/step %d° | after stuck %d, paused %.0f s, survey turn %d°, swing/step %d°' % (T['b'][0], T['b'][1], T['b'][2], T['b'][3] / max(1, T['b'][4]), T['a'][0], T['a'][1], T['a'][2], T['a'][3] / max(1, T['a'][4])))
