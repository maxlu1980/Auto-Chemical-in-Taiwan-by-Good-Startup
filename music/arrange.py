# 鄧雨賢〈望春風〉(1933) and〈雨夜花〉(1934) — melodies in the public domain — arranged for a full orchestra and rendered from recorded
# instruments (VSCO 2 Community Edition, CC0): the opening film (bars and title exactly as the film's own plan) and the title's two turns.
#   python3 arrange.py <library dir> <lib.json> <song.json> <out dir> [film|bch|uih|all]
import sys, os, json, math, random
import numpy as np, soundfile as sf
import sampler as S
from sampler import Part, Art, SR

LIBDIR, LIBJ, SONGJ, OUT = sys.argv[1:5]; WHAT = sys.argv[5] if len(sys.argv) > 5 else 'all'
S.setup(LIBDIR, LIBJ); SONG = json.load(open(SONGJ)); random.seed(19330415)
os.makedirs(OUT, exist_ok=True)

TIMP = {1: 41.46, 2: 46.81, 3: 49.5, 4: 52.42, 5: 54.58}  # the principal tone of each drum, measured
def timp_pitch(fn, r):
    import re; m = re.search(r'Timpani(\d)_', fn); return TIMP[int(m.group(1))]

def orchestra(length):
    """the desks and their seats (azimuth from the conductor's view, the depth of the stage)"""
    P = {}
    def mk(name, az, zone, width, gain, rng, arts):
        p = Part(name, length, az, zone, width, gain, rng); p.arts = arts; P[name] = p; return p
    VS = 'Strings/Violin Section/'; VA = 'Strings/Viola Section/'; VC = 'Strings/Cello Section/'; CB = 'Strings/Solo Contrabass/'
    mk('vln1', -42, 'front', 0.55, 1.0, 24, {'sus': Art(VS + 'susVib'), 'spic': Art(VS + 'Spic'), 'pizz': Art(VS + 'Pizz'), 'trem': Art(VS + 'Trem')})
    mk('vln2', -16, 'front', 0.5, 0.9, 24, {'sus': Art(VS + 'susVib'), 'spic': Art(VS + 'Spic'), 'pizz': Art(VS + 'Pizz'), 'trem': Art(VS + 'Trem')})
    mk('vla', 14, 'front', 0.5, 0.95, 24, {'sus': Art(VA + 'susvib'), 'spic': Art(VA + 'spic'), 'pizz': Art(VA + 'pizz'), 'trem': Art(VA + 'trem')})
    mk('vc', 34, 'front', 0.55, 1.0, 24, {'sus': Art(VC + 'susvib'), 'spic': Art(VC + 'spic'), 'pizz': Art(VC + 'pizzT'), 'trem': Art(VC + 'trem')})
    mk('cb', 48, 'mid', 0.45, 0.62, 24, {'sus': Art(CB + 'SusVib'), 'spic': Art(CB + 'Spic'), 'pizz': Art(CB + 'Pizz'), 'trem': Art(CB + 'Trem')})
    mk('fl', -8, 'mid', 0.3, 0.9, 20, {'sus': Art('Woodwinds/Flute/expvib'), 'sus2': Art('Woodwinds/Flute/susvib'), 'stac': Art('Woodwinds/Flute/stac')})
    mk('ob', 6, 'mid', 0.3, 0.8, 20, {'sus': Art('Woodwinds/Oboe/Vib')})
    mk('cl', -18, 'mid', 0.3, 0.8, 20, {'sus': Art('Woodwinds/Clarinet/susLong')})
    mk('bn', 18, 'mid', 0.3, 0.8, 20, {'sus': Art('Woodwinds/Bassoon/sus')})
    mk('hn', -30, 'back', 0.4, 0.85, 26, {'sus': Art('Brass/F Horn/sus')})
    mk('tpt', 6, 'back', 0.35, 0.7, 26, {'sus': Art('Brass/Trumpet/susvib')})
    mk('tbn', 22, 'back', 0.35, 0.75, 26, {'sus': Art('Brass/Tenor Trombone/sus')})
    mk('tba', 34, 'back', 0.35, 0.8, 26, {'sus': Art('Brass/Tuba/sus')})
    mk('timp', -14, 'back', 0.5, 0.9, 30, {'hit': Art('Percussion/Timpani', pitch=timp_pitch), 'roll': Art('Percussion/Timpani/Rolls', pitch=timp_pitch)})
    mk('hp', -58, 'mid', 0.45, 0.5, 22, {'pl': Art('Strings/Harp', offset=0)})
    mk('glk', 20, 'back', 0.4, 0.9, 24, {'hit': Art('Percussion/Glock', offset=12)})
    mk('bd', 28, 'back', 0.5, 0.8, 30, {'hit': Art('VSCO 1 Percussion/drums/bass', pitch=lambda f, r: None, only=r'^bdrum_(ppp|pp|p|mp|mf|f|ff|fff)_\d')})
    mk('cym', 24, 'back', 0.6, 0.36, 30, {'clash': Art('VSCO 1 Percussion/varMetal/Cymbals/clash', pitch=lambda f, r: None, only=r'^crash_hit_(pp|mp|ff|fff)_loose'),
                                         'roll': Art('VSCO 1 Percussion/varMetal/Cymbals/susp', pitch=lambda f, r: None, only=r'softmall_roll2_cresc')})
    return P

def pent_up(root, n):
    PEN = SONG['PENT']; return [root + 12 * (i // 5) + PEN[i % 5] for i in range(n)]

def arch(sb, beat):
    u = ((sb % 4) + beat / 4) / 4; return 0.84 + 0.16 * math.sin(math.pi * u)

def hj(s=0.012): return (random.random() - 0.5) * s  # a player's hair of unevenness in time

def line(p, art, notes, base, tr=0, breath=False, phrase_starts=(0, 4, 8, 12), detune=0.0, kind_long='swell', amt=0.1, last_hold=None, rel_end=0.6, ahead=0.05):
    """a melody, slurred within each phrase: notes = [(t, d, midi, song bar, beat, beats)]; a wind player breathes before each phrase"""
    for i, (t, d, m, sb, bt, bs) in enumerate(notes):
        start = (bt == 0 and sb in phrase_starts) or i == 0
        nxt = notes[i + 1] if i + 1 < len(notes) else None
        nxt_leg = nxt is not None and not (nxt[4] == 0 and nxt[3] in phrase_starts)
        dd = d if last_hold is None or nxt is not None else last_hold
        if nxt_leg: dd += 0.05  # the bow keeps going into the next note
        if breath and nxt is not None and not nxt_leg: dd = max(0.15, dd - 0.14)
        dyn = base * arch(sb, bt)
        p.sus(art, m + tr, t + hj(), dd, dyn, kind=(kind_long if bs >= 2 or dd > 1.4 else 'flat'), amt=amt if bs >= 2 else 0.04,
              rel=(0.2 if nxt_leg else rel_end), legato=not start, ahead=ahead, detune=detune)

def chord_pad(p, art, ms, t, d, dyn, kind='swell', amt=0.06, rel=0.5, ahead=0.09, detune=0.0, spread=0.03):
    for i, m in enumerate(ms): p.sus(art, m, t + i * spread + hj(0.02), d, dyn, kind=kind, amt=amt, rel=rel, ahead=ahead, detune=detune)

def cb_section(P, art, m, t, d=None, dyn=0.5, **kw):
    """the basses: a solo player recorded, three on the desk (each a few cents and a few milliseconds apart)"""
    for k, (dt, dc, g) in enumerate([(0.0, 0.0, 1.0), (0.013, 6.0, 0.8), (0.024, -5.0, 0.7)]):
        if d is None: P['cb'].hit(art, m, t + dt, dyn * g ** 0.5, detune=dc, rr=k)
        else: P['cb'].sus(art, m, t + dt, d, dyn * g ** 0.5, detune=dc, rr=k, **kw)

# =============================== the opening film ===============================
def film():
    F = SONG['film']; bars = F['bars']; tF = F['tF']; hold = F['hold']; T = F['T']; LEN = T + 3.2
    P = orchestra(LEN)
    def at(b, beat): return bars[b][0] + bars[b][1] * beat / 4
    def dur(b, beats): return bars[b][1] * beats / 4
    def nat(b0, sb0, q):
        b = b0 + q[0] - sb0; beat = q[1] + q[3]; nb = b + int(beat // 4)
        e = (bars[-1][0] + bars[-1][1]) if nb >= len(bars) else at(nb, beat % 4); return at(b, q[1]), e - at(b, q[1])
    M = SONG['BCH']; H = SONG['BCH_H']; P1 = [q for q in M if q[0] < 8]; P2 = [q for q in M if q[0] >= 12]

    # 1. the introduction: the dominant, the low strings trembling, a high violin held, the harp rising
    d0 = dur(0, 4) + 0.15
    P['vc'].sus('trem', 48, at(0, 0), d0, 0.4, kind='cresc', amt=0.12, rel=0.5, ahead=0.02)
    P['vla'].sus('trem', 55, at(0, 0) + 0.02, d0, 0.3, kind='cresc', amt=0.12, rel=0.5, ahead=0.02)
    P['vln2'].sus('trem', 64, at(0, 0) + 0.04, d0, 0.25, kind='cresc', amt=0.1, rel=0.5, ahead=0.02, detune=4)
    P['vln1'].sus('sus', 84, at(0, 0), d0 + 0.2, 0.2, kind='swell', amt=0.08, rel=0.9, ahead=0.12)
    cb_section(P, 'pizz', 36, at(0, 0), dyn=0.36)
    P['timp'].hit('hit', 48, at(0, 2), 0.3)
    for j, m in enumerate(pent_up(48, 9)): P['hp'].hit('pl', m, at(0, 0.6) + j * dur(0, 0.34) * (1 + j * 0.03), 0.3 + 0.12 * j / 8)

    # 2. the song's first half, dolce: the flute, then the first violins with a clarinet below; plucked basses, broken chords in the harp
    mel = [(*nat(1, 0, q), q[2], q[0], q[1], q[3]) for q in P1]
    line(P['fl'], 'sus', [n for n in mel if n[3] < 4], 0.57, tr=12, breath=True, phrase_starts=(0, 4))
    line(P['vln1'], 'sus', [n for n in mel if n[3] >= 4], 0.52, tr=12, phrase_starts=(4,), amt=0.1)
    line(P['cl'], 'sus', [n for n in mel if 4 <= n[3] < 6], 0.44, tr=0, breath=True, phrase_starts=(4,))
    line(P['fl'], 'sus2', [n for n in mel if n[3] >= 6], 0.3, tr=12, breath=True, phrase_starts=(6,))
    for j, h in enumerate(H[:8]):
        b = 1 + j; lv = 0.78 + 0.22 * min(1, j / 7)
        if j < 4:
            cb_section(P, 'pizz', h['b'][0] - 12, at(b, 0), dyn=0.5 * lv)
            P['vc'].hit('pizz', h['b'][0], at(b, 0) + 0.01, 0.44 * lv); P['vc'].hit('pizz', h['b'][1], at(b, 2) + hj(), 0.38 * lv)
            for bt in (1, 3):
                P['vln2'].hit('pizz', h['c'][1] + 12, at(b, bt) + hj(), 0.12 * lv * (0.85 if bt == 3 else 1))
                P['vln1'].hit('pizz', h['c'][2] + 12, at(b, bt) + 0.012 + hj(), 0.11 * lv * (0.85 if bt == 3 else 1))
                P['vla'].hit('pizz', h['c'][0], at(b, bt) + 0.006 + hj(), 0.12 * lv * (0.85 if bt == 3 else 1))
        else:
            cb_section(P, 'pizz', h['b'][0] - 12, at(b, 0), dyn=0.5 * lv); cb_section(P, 'pizz', h['b'][1] - 12, at(b, 2), dyn=0.42 * lv)
            P['vc'].sus('sus', h['b'][0], at(b, 0), dur(b, 4), 0.3 * lv, kind='swell', amt=0.06, rel=0.45, ahead=0.09)
            chord_pad(P['vla'], 'sus', h['c'][:2], at(b, 0), dur(b, 4), 0.24 * lv)
            P['vln2'].sus('sus', h['c'][2], at(b, 0) + 0.03, dur(b, 4), 0.2 * lv, kind='swell', amt=0.06, rel=0.45, ahead=0.09, detune=4)
            P['bn'].sus('sus', h['b'][0], at(b, 0) + 0.02, dur(b, 4), 0.28 * lv, kind='swell', amt=0.06, rel=0.4, ahead=0.06)
        for k2, (bt, ci, up) in enumerate([(1, 0, 0), (1.5, 1, 0), (2.5, 2, 0), (3, 1, 0), (3.5, 2, 12)]):
            P['hp'].hit('pl', h['c'][ci] + up, at(b, bt) + hj(0.016), (0.4 if k2 == 0 else 0.33) * lv)
        if j >= 6: chord_pad(P['hn'], 'sus', [h['c'][1] - 12, h['c'][2] - 12], at(b, 0) + 0.05, dur(b, 4), 0.26, amt=0.08, rel=0.6)

    # into the full statement: the cymbal grows, the timpani roll on C, the strings tremble on the dominant, a pentatonic run in spiccato
    bL = 8
    P['cym'].seg('roll', at(bL - 1, 0), dur(bL - 1, 7), 0.1, 0.34, src_at=0.3)
    P['timp'].seg('roll', at(bL, 0), dur(bL, 4), 0.2, 0.5, m=48, src_at=1.0, fout=0.3)
    for part, ms, d1 in (('vla', [55, 60], 0.26), ('vc', [48], 0.3)):
        for m in ms: P[part].sus('trem', m, at(bL, 2), dur(bL, 2) + 0.05, d1, kind='cresc', amt=0.16, rel=0.25, ahead=0.02)
    cb_section(P, 'trem', 36, at(bL, 2), d=dur(bL, 2) + 0.05, dyn=0.32, kind='cresc', amt=0.16, rel=0.25, ahead=0.02)
    P['vln2'].sus('trem', 64, at(bL, 0), dur(bL, 2), 0.22, kind='cresc', amt=0.1, rel=0.2, ahead=0.02, detune=4)
    for j, m in enumerate(pent_up(65, 8)):
        tt = at(bL, 2) + j * dur(bL, 2) / 8; g = 0.34 + 0.18 * j / 7
        P['vln1'].hit('spic', m + 12, tt + hj(0.008), g); P['vln2'].hit('spic', m, tt + 0.006 + hj(0.008), g * 0.9)
        P['hp'].hit('pl', m + 12, tt + 0.004, 0.42)
    P['vc'].hit('spic', 48, at(bL, 3.5), 0.5); cb_section(P, 'spic', 36, at(bL, 3.5), dyn=0.52)

    # 3. the song's last two phrases for everyone, strings-led: violins in octaves, flute, oboe and horn with them; the violas and cellos
    #    pulse in spiccato under the held winds; basses and tuba bowed; timpani soft on one and three
    mel2 = [(*nat(9, 12, q), q[2], q[0], q[1], q[3]) for q in P2]
    body = mel2[:-1]; last = mel2[-1]
    line(P['vln1'], 'sus', body, 0.7, tr=12, phrase_starts=(12,), amt=0.08)
    line(P['vln2'], 'sus', body, 0.66, tr=0, phrase_starts=(12,), amt=0.08, detune=4)
    line(P['fl'], 'sus', body, 0.46, tr=12, phrase_starts=(12,), breath=True)
    line(P['ob'], 'sus', body, 0.46, tr=0, phrase_starts=(12,), breath=True)
    line(P['hn'], 'sus', body, 0.6, tr=0, phrase_starts=(12,), breath=True, ahead=0.04)
    for j, h in enumerate(H[12:16]):
        b = 9 + j; end = at(b, 4) if b < 12 else tF; d = end - at(b, 0)
        cb_section(P, 'sus', h['b'][0] - 12, at(b, 0), d=d, dyn=0.56, kind='swell', amt=0.05, rel=0.35, ahead=0.06)
        P['tba'].sus('sus', h['b'][0] - 12, at(b, 0) + 0.02, d, 0.36, kind='swell', amt=0.05, rel=0.35, ahead=0.05)
        P['bn'].sus('sus', h['b'][0], at(b, 0) + 0.02, d, 0.4, kind='swell', amt=0.05, rel=0.35, ahead=0.05)
        P['cl'].sus('sus', h['c'][1], at(b, 0) + 0.03, d, 0.42, kind='swell', amt=0.05, rel=0.35, ahead=0.05)
        chord_pad(P['tbn'], 'sus', [h['c'][0] - 12, h['c'][2] - 12], at(b, 0) + 0.04, d, 0.36, amt=0.05, rel=0.4)
        tp = 48 if h['b'][0] == 36 else 41
        P['timp'].hit('hit', tp, at(b, 0), 0.5)
        for bt in (1, 3):
            if at(b, bt) >= tF - 0.05: continue
            for m in h['c'][:2]: P['vla'].hit('spic', m, at(b, bt) + hj(0.01), 0.4)
            P['vc'].hit('spic', h['b'][1] if bt == 3 else h['b'][0] + 12, at(b, bt) + hj(0.01), 0.42)
            P['timp'].hit('hit', tp, at(b, bt), 0.28) if bt == 3 else None
        for bt, ci in ((1, 0), (2.5, 2), (3.5, 1)):
            if at(b, bt) < tF - 0.05: P['hp'].hit('pl', h['c'][ci] + 12, at(b, bt) + hj(0.016), 0.38)

    # 4. the last note, F major, with the title: everyone, broad but warm; a timpani roll dying away; cymbals; the harp's sweep; the glockenspiel
    hd = hold; R = 2.6
    for m, g in ((29, 0.58), (41, 0.52)): cb_section(P, 'sus', m, tF, d=hd, dyn=g, kind='swell', amt=0.1, rel=R, ahead=0.06)
    chord_pad(P['vc'], 'sus', [41, 48, 53], tF, hd, 0.56, amt=0.1, rel=R, ahead=0.07)
    chord_pad(P['vla'], 'sus', [57, 60], tF, hd, 0.52, amt=0.1, rel=R, ahead=0.07)
    for m in (65, 69): P['vln2'].sus('trem', m, tF + hj(0.02), hd, 0.48, kind='swell', amt=0.1, rel=R, ahead=0.03, detune=4)
    chord_pad(P['vln1'], 'sus', [72, 77, 81], tF, hd, 0.5, amt=0.1, rel=R, ahead=0.07)
    P['vln1'].sus('sus', 89, tF + 0.08, hd, 0.26, kind='swell', amt=0.1, rel=R, ahead=0.1)
    P['fl'].sus('sus', 89, tF, hd, 0.42, kind='swell', amt=0.1, rel=R * 0.7); P['fl'].sus('sus2', 81, tF + 0.02, hd, 0.36, kind='swell', amt=0.1, rel=R * 0.7)
    P['ob'].sus('sus', 81, tF, hd, 0.4, kind='swell', amt=0.1, rel=R * 0.7); P['cl'].sus('sus', 72, tF, hd, 0.4, kind='swell', amt=0.1, rel=R * 0.7)
    chord_pad(P['bn'], 'sus', [41, 53], tF, hd, 0.45, amt=0.1, rel=R * 0.8)
    chord_pad(P['hn'], 'sus', [60, 65, 69], tF, hd, 0.62, amt=0.1, rel=R * 0.8, ahead=0.05)
    chord_pad(P['tpt'], 'sus', [72, 77], tF + 0.02, hd, 0.42, amt=0.08, rel=R * 0.7, ahead=0.04)
    chord_pad(P['tbn'], 'sus', [41, 48], tF, hd, 0.5, amt=0.08, rel=R * 0.8)
    P['tba'].sus('sus', 29, tF, hd, 0.5, kind='swell', amt=0.08, rel=R * 0.8)
    P['timp'].hit('hit', 41, tF, 0.62); P['timp'].seg('roll', tF + 0.08, hd, 0.4, 0.12, m=41, src_at=1.5, fout=1.2)
    P['bd'].hit('hit', None, tF, 0.38)
    P['cym'].seg('roll', tF - 1.3, 1.3, 0.2, 0.48, src_at=2.0, fout=0.25)
    P['cym'].hit('clash', None, tF, 0.36)
    for j, m in enumerate(pent_up(41, 12)): P['hp'].hit('pl', m, tF - 0.6 + j * 0.05, 0.45)
    for j, m in enumerate((89, 93, 96, 101)): P['glk'].hit('hit', m, tF + 0.35 + j * 0.18, 0.62)
    return P, LEN

# =============================== the title's turns ===============================
def turn(uih):
    bl = SONG['loop']['bl']; bt = bl / 4; M = SONG['UIH'] if uih else SONG['BCH']; H = SONG['UIH_H'] if uih else SONG['BCH_H']; nB = 8 if uih else 16
    LEN = (2 + nB) * bl + 4.6; P = orchestra(LEN); b0 = 2 * bl
    def at(b, beat): return b0 + b * bl + beat * bt
    # the link: two bars on the dominant
    for j, m in enumerate(pent_up(48, 8)): P['hp'].hit('pl', m, j * bl * 2 / 9 + 0.05, 0.42 + 0.12 * j / 7)
    cb_section(P, 'pizz', 36, 0.05, dyn=0.45)
    P['vln1'].sus('sus', 84, 0.05, bl * 1.9, 0.16, kind='swell', amt=0.06, rel=0.9, ahead=0.15)
    P['vc'].sus('sus', 48, 0.05, bl * 1.9, 0.24, kind='swell', amt=0.08, rel=0.7, ahead=0.12)
    P['vla'].sus('sus', 55, 0.1, bl * 1.9, 0.2, kind='swell', amt=0.08, rel=0.7, ahead=0.12)
    P['timp'].hit('hit', 48, bl + 2 * bt, 0.2)
    notes = [(at(q[0], q[1]), q[3] * bt, q[2], q[0], q[1], q[3]) for q in M]
    if not uih:
        line(P['fl'], 'sus', notes, 0.44, tr=12, breath=True, phrase_starts=(0, 4, 8, 12))
        sec = [n for n in notes if n[3] >= 8]
        line(P['cl'], 'sus', sec, 0.3, tr=0, breath=True, phrase_starts=(8, 12))
        line(P['vln2'], 'sus', sec, 0.26, tr=0, phrase_starts=(8, 12), detune=4)
    else:
        line(P['vln1'], 'sus', notes, 0.5, tr=12, phrase_starts=(0, 4), amt=0.1)
        line(P['ob'], 'sus', notes, 0.32, tr=0, breath=True, phrase_starts=(0, 4))
        line(P['vc'], 'sus', notes, 0.3, tr=-12, phrase_starts=(0, 4))
        line(P['fl'], 'sus2', [n for n in notes if n[3] >= 4], 0.28, tr=12, breath=True, phrase_starts=(4,))
    for j, h in enumerate(H):
        tb = at(j, 0); lv = 1.0 if uih else 0.82 + 0.18 * min(1, j / 15)
        chord_pad(P['vla'], 'sus', h['c'][:2], tb, bl, (0.24 if uih else 0.2) * lv)
        if not uih: P['vc'].sus('sus', h['b'][0], tb, bl, 0.22 * lv, kind='swell', amt=0.05, rel=0.45, ahead=0.09)
        else: P['vln2'].sus('sus', h['c'][2], tb + 0.03, bl, 0.2, kind='swell', amt=0.05, rel=0.45, ahead=0.09, detune=4)
        cb_section(P, 'pizz', h['b'][0] - 12, tb, dyn=0.44 * lv); cb_section(P, 'pizz', h['b'][1] - 12, tb + 2 * bt, dyn=0.36 * lv)
        for k2, (b2, ci, up) in enumerate([(1, 0, 0), (1.5, 1, 0), (2.5, 2, 0), (3, 1, 0), (3.5, 2, 12)]):
            P['hp'].hit('pl', h['c'][ci] + up, tb + b2 * bt + hj(0.016), (0.36 if k2 == 0 else 0.3) * lv)
        if not uih and j < 8:
            for b2 in (1, 3): P['vln1'].hit('pizz', h['c'][2] + 12, tb + b2 * bt + hj(), 0.26 * (0.85 if b2 == 3 else 1))
        if uih or j >= 8: chord_pad(P['hn'], 'sus', [h['c'][1] - 12, h['c'][2] - 12], tb + 0.05, bl, 0.2, amt=0.06, rel=0.6)
    for j, m in enumerate((89, 93, 96)): P['glk'].hit('hit', m, at(nB - 1, 2) + j * 0.2, 0.42)
    return P, LEN

WINS = {'opening': {'intro': (0.35, 2.15), 'A': (2.15, 14.15), 'B': (14.15, 23.15), 'run': (23.15, 26.15), 'tutti': (26.15, 36.35), 'final': (36.35, 40.4)}}
RIDE = {'opening': [(0, 0.0), (2.0, 0.0), (2.6, 1.2), (14.0, 1.2), (15.0, 0.0), (25.6, 0.0), (26.6, -1.8), (35.6, -1.8), (36.3, -2.4), (60, -2.4)]}  # the fader, as a mixer rides it
def render(name, P, LEN, target, at_a, at_b):
    parts = list(P.values())
    mix = S.hall(parts)
    if name in RIDE:
        pts = np.array(RIDE[name]); tt = np.arange(len(mix)) / SR; mix = mix * (10 ** (np.interp(tt, pts[:, 0], pts[:, 1]) / 20))[:, None].astype(np.float32)
    raw = S.loud(mix, at_a, at_b); g = target - raw
    out = S.master(mix, g)
    sf.write(os.path.join(OUT, name + '.wav'), out, SR, subtype='PCM_16')
    WIN = WINS.get(name) or {'all': (at_a, at_b)}
    def act(x, a, b):
        seg = x[int(a * SR):int(b * SR)]; e = np.mean(seg ** 2, 1); thr = e.max() * 1e-3 if e.size else 0
        on = e[e > thr]; return round(float(10 * np.log10(on.mean() + 1e-12)), 1) if on.size else None
    stems = {k: {p.name: act(p.buf * 1.0, *w) for p in parts if np.any(p.buf[int(w[0] * SR):int(w[1] * SR)])} for k, w in WIN.items()}
    return out, stems, g

if __name__ == '__main__':
    rep = {}
    if WHAT in ('film', 'all'):
        P, L = film(); out, st, g = render('opening', P, L, -25.6, 9.0, 23.0)
        rep['film'] = {'per_s': [round(S.loud(out, s, s + 1), 1) for s in range(int(L))], 'peak': float(np.abs(out).max()), 'gain': round(g, 1), 'stems_dolce': st,
                       'A': round(S.loud(out, 2.2, 14), 1), 'dolce': round(S.loud(out, 9, 23), 1), 'broad': round(S.loud(out, 26.5, 35.5), 1), 'final': round(S.loud(out, 36.4, 39.5), 1), 'notes': sum(p.n for p in P.values())}
    for nm, u in (('title_bch', False), ('title_uih', True)):
        if WHAT in (nm.split('_')[1], 'all'):
            P, L = turn(u); out, st, g = render(nm, P, L, -27.5, 8.0, L - 6)
            rep[nm] = {'len': L, 'peak': float(np.abs(out).max()), 'gain': round(g, 1), 'stems': st, 'notes': sum(p.n for p in P.values()), 'per_s': [round(S.loud(out, s, s + 1), 1) for s in range(int(L))]}
    print(json.dumps(rep, indent=1, default=float))
