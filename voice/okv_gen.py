# Okachimachi's recorded announcements: one list of lines, from which come (1) the text file VOICEVOX reads in (character, line), (2) the list for
# the person who makes the recordings (number, voice, line, how the names are read), (3) the table the page uses (which line is which recording)
#   python3 okv_gen.py <out dir for the person> <src dir of the page>
import sys, os, json, csv
OUT, SRC = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
F, M = '九州そら（ノーマル）', '玄野武宏（ノーマル）'   # tracks 1 and 3 are announced by the woman's voice, tracks 2 and 4 by the man's
KT = {1: ['大船', '磯子', '桜木町', '蒲田'], 4: ['大宮', '南浦和', '赤羽']}; KIND = [('L', '各駅停車'), ('R', '快速')]
YAM = {2: '東京・品川方面', 3: '上野・池袋方面'}
L = []   # (key, voice 'f'|'m', text)
def add(key, v, t): assert ',' not in t, t; L.append((key, v, t))
def track(n, v):
    if n in KT:
        for kk, kn in KIND:
            for d in KT[n]: add('nx.%d.%s.%s' % (n, kk, d), v, '今度の、%d番線の電車は、%s、%sゆきです。' % (n, kn, d))
        for kk, kn in KIND:
            for d in KT[n]: add('in.%d.%s.%s' % (n, kk, d), v, 'まもなく、%d番線に、%s、%sゆきがまいります。' % (n, kn, d))
    else:
        add('nx.%d' % n, v, '今度の、%d番線の電車は、%sゆきです。' % (n, YAM[n])); add('in.%d' % n, v, 'まもなく、%d番線に、%sゆきがまいります。' % (n, YAM[n]))
for v, tracks in (('f', (1, 3)), ('m', (4, 2))):
    for n in tracks: track(n, v)
    add('caution.' + v, v, '危ないですから、黄色い点字ブロックまで、お下がりください。')
    add('arr.' + v, v, '御徒町、御徒町。ご乗車、ありがとうございます。')
    for n in sorted(tracks): add('go.%d' % n, v, '%d番線、ドアが閉まります。ご注意ください。' % n)
    if v == 'f':
        add('care.1', v, 'お客さまにお願いいたします。駅構内やホームでの歩きスマホは、危険ですので、おやめください。')
        add('care.2', v, '駆け込み乗車は、危険ですので、おやめください。')
        add('care.3', v, 'ホームドアに、もたれかかったり、身を乗り出したりしないでください。')
        add('care.4', v, 'エスカレーターをご利用の際は、手すりにつかまり、黄色い線の内側にお立ちください。')
    else:
        add('care.5', v, '黄色い点字ブロックの内側を、お歩きください。')
assert len(set(k for k, _, _ in L)) == len(L)
# (1) what VOICEVOX reads in: one line each, "character（style）,text" — the exported files then carry the line's number first
open(OUT + '/okachimachi_voicevox.txt', 'w', encoding='utf-8', newline='\r\n').write('\n'.join('%s,%s' % (F if v == 'f' else M, t) for _, v, t in L) + '\n')
# (2) the list, with the readings to check by ear
READ = {'御徒町': 'おかちまち', '大船': 'おおふな', '磯子': 'いそご', '桜木町': 'さくらぎちょう', '蒲田': 'かまた', '大宮': 'おおみや', '南浦和': 'みなみうらわ', '赤羽': 'あかばね', '上野・池袋方面': 'うえの・いけぶくろほうめん', '東京・品川方面': 'とうきょう・しながわほうめん', '各駅停車': 'かくえきていしゃ', '快速': 'かいそく', '点字ブロック': 'てんじブロック', '番線': 'ばんせん（1 いち・2 に・3 さん・4 よん）', '駆け込み乗車': 'かけこみじょうしゃ', '手すり': 'てすり'}
with open(OUT + '/okachimachi_lines.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f); w.writerow(['編號', '聲音', '角色（風格）', '台詞', '注意讀音'])
    for i, (k, v, t) in enumerate(L): w.writerow(['%03d' % (i + 1), '女聲' if v == 'f' else '男聲', F if v == 'f' else M, t, '、'.join('%s＝%s' % (a, b) for a, b in READ.items() if a in t)])
# (3) the page's table: key → [number, voice, text]
T = {k: ['%03d' % (i + 1), v, t] for i, (k, v, t) in enumerate(L)}
open(SRC + '/okv_lines.js', 'w', encoding='utf-8').write("/* ===== [okv_lines.js] ===== */\n  /* (v79) Okachimachi's announcements, line by line: the key the page asks by → [the recording's number, the voice (f: tracks 1 and 3, m: tracks 2 and 4), the words].\n     Made by okv/okv_gen.py together with the text file the recordings are made from — the two always agree. */\n  var OKV_T = " + json.dumps(T, ensure_ascii=False, separators=(', ', ': ')) + ";\n")
print(len(L), 'lines;', sum(1 for _, v, _ in L if v == 'f'), 'woman,', sum(1 for _, v, _ in L if v == 'm'), 'man')
for i, (k, v, t) in enumerate(L):
    if i in (0, 8, 16, 17, 18, 19, 20, 22, 26, 27, 39, 44): print('%03d' % (i + 1), k, v, t)
