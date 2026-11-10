# the English lines as jobs for the speech model (voice/okv_en_gen.mjs): which voice says each, and the stations' names given their sounds
# (in the International Phonetic Alphabet, between braces) so that they are said as they are in Japan and not spelt out as English words
#   python3 okv_en_jobs.py <src dir of the page> <jobs.json> [woman's voice] [man's voice] [speed]
import sys, re, json
SRC, OUT = sys.argv[1], sys.argv[2]; VF = sys.argv[3] if len(sys.argv) > 3 else 'af_heart'; VM = sys.argv[4] if len(sys.argv) > 4 else 'am_michael'; SPEED = float(sys.argv[5]) if len(sys.argv) > 5 else 0.95
NAME = {'Ofuna': 'ˈoʊfuːnɑː', 'Isogo': 'ˈiːsoʊɡoʊ', 'Sakuragicho': 'sˌɑːkuːɹɑːɡˈiːtʃoʊ', 'Kamata': 'kˈɑːmɑːtɑː', 'Omiya': 'ˈoʊmiːjɑː', 'Minami-Urawa': 'mˌiːnɑːmiː uːɹˈɑːwɑː', 'Akabane': 'ˌɑːkɑːbˈɑːneɪ',
        'Shinagawa': 'ʃˌiːnɑːɡˈɑːwɑː', 'Ueno': 'uːˈɛnoʊ', 'Ikebukuro': 'ˌiːkeɪbˈuːkʊɹoʊ'}
T = json.loads(re.search(r'var OKV_TE = (\{.*\});', open(SRC + '/okv_lines_en.js', encoding='utf-8').read(), re.S).group(1))
jobs = []
for key, (num, v, en) in sorted(T.items(), key=lambda q: q[1][0]):
    t = en
    for n, ipa in NAME.items(): t = re.sub(r'\b' + re.escape(n) + r'\b', '{' + ipa + '}', t)
    jobs.append({'id': num, 'voice': VF if v == 'f' else VM, 'speed': SPEED, 'text': t, 'en': en})
json.dump(jobs, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(len(jobs), 'jobs;', VF, VM, SPEED); print(jobs[0]['text']); print(jobs[14]['text'])
