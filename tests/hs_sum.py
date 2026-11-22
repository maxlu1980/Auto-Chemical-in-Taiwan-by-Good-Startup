# (v89) the audit's log, one line per phase: how far the view was moved and turned, whether the tool stayed in the picture, the posture, the key points shown
import sys, json
for l in open(sys.argv[1], encoding='utf-8'):
    l = l.strip()[9:]
    if l.startswith('=='): print(l); continue
    if not (l.startswith('drive') or l.startswith('survey')): continue
    try: k, rest = l.split(' {', 1); d = json.loads('{' + rest)
    except Exception: continue
    if d.get('kind') == 'survey': print('  survey n=%s taps=%s viewTurn=%s userTurn=%s done=%s' % (d.get('n'), d.get('taps'), d.get('viewTurn', d.get('turnTotal')), d.get('userTurn', d.get('turnTotal')), d.get('done'))); continue
    print('  %-22s move=%-5s swing=%-4s maxOff=%-4s paused=%-4s slide=%-5s track=%-5s eye=%-5s key=%-4s swaps=%-2s done=%s%s' % (d['step'][:12], d['move'], d['swing'], d['maxOff'], d.get('paused'), d.get('slide'), d.get('track'), d.get('eye'), d.get('key'), d.get('toolSwaps'), d['done'], ' STUCK' if d.get('stuck') else ''))
