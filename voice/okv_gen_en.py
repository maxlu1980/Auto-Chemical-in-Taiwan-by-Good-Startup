# Okachimachi's English announcements, line by line: the English that follows the approach and the safety announcements. One list, from which
# come the list for whoever makes the recordings and the page's table (which line is which recording). The page plays an English line only
# if its recording is carried (window.AC_OKV_EN); it is never spoken by the device.
#   python3 okv_gen_en.py <out dir for the person> <src dir of the page>
import sys, os, json, csv
OUT, SRC = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
KT = {1: [('大船', 'Ofuna'), ('磯子', 'Isogo'), ('桜木町', 'Sakuragicho'), ('蒲田', 'Kamata')], 4: [('大宮', 'Omiya'), ('南浦和', 'Minami-Urawa'), ('赤羽', 'Akabane')]}
KIND = [('L', 'local'), ('R', 'rapid')]; YAM = {2: 'Tokyo and Shinagawa', 3: 'Ueno and Ikebukuro'}
L = []   # (key, voice: f tracks 1 and 3, m tracks 2 and 4, the English)
def add(key, v, en): L.append((key, v, en))
def track(n, v):
    if n in KT:
        for kk, en in KIND:
            for d, de in KT[n]: add('in.%d.%s.%s' % (n, kk, d), v, 'The %s train bound for %s will soon arrive at track %d.' % (en, de, n))
    else: add('in.%d' % n, v, 'The train bound for %s will soon arrive at track %d.' % (YAM[n], n))
for v, tracks in (('f', (1, 3)), ('m', (4, 2))):
    for n in tracks: track(n, v)
    add('caution.' + v, v, 'Please stand behind the yellow warning blocks.')
    if v == 'f':
        add('care.1', v, 'Attention, please. For your safety, please do not use your smartphone while walking in the station.')
        add('care.2', v, 'Rushing to board a train is dangerous. Please do not do so.')
        add('care.3', v, 'Please do not lean on the platform doors or lean over them.')
        add('care.4', v, 'On the escalator, please hold the handrail and stand inside the yellow lines.')
    else:
        add('care.5', v, 'Please walk on the inner side of the yellow tactile blocks.')
assert len(set(k for k, _, _ in L)) == len(L)
with open(OUT + '/okachimachi_lines_en.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(['編號', '聲音', '英語句子'])
    for i, (k, v, en) in enumerate(L): w.writerow(['E%02d' % (i + 1), '女聲' if v == 'f' else '男聲', en])
T = {k: ['E%02d' % (i + 1), v, en] for i, (k, v, en) in enumerate(L)}
open(SRC + '/okv_lines_en.js', 'w', encoding='utf-8').write("/* ===== [okv_lines_en.js] ===== */\n  /* (v81) Okachimachi's English announcements, line by line: the key the page asks by → [the recording's number, the voice (f: tracks 1 and 3, m: tracks 2 and 4), the English]; made by voice/okv_gen_en.py. A line is played only if its recording is carried by the page */\n  var OKV_TE = " + json.dumps(T, ensure_ascii=False) + ";\n")
print(len(L), 'lines;', sum(1 for _, v, _ in L if v == 'f'), 'woman,', sum(1 for _, v, _ in L if v == 'm'), 'man')
