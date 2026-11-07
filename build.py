# build.py — assembles the Auto Chemical interactive guide from src/ and writes the deployable site into docs/.
#
#   python3 build.py            build everything (docs/index.html, build/guide.html, build/guide.min.html, build/test_local.html, build/test_min.html)
#   python3 build.py --check    build into a temporary folder and compare with docs/index.html (exit 1 on a difference)
#
# The page is one HTML file: the modules listed in src/_order.txt are concatenated between src/_pre.html and src/_post.html,
# the start loader (src/_boot.html) goes in after the font links, the code is cut into parts at whole-module boundaries (each part
# reporting to the loader as it runs), and the two style sheets src/css_extra_add.css and src/css_final.css are appended to the
# page's own. Minification (terser; comments and spare whitespace only — no renaming, the code is the same code) produces the
# published page. docs/index.html carries the document skeleton (doctype, head, meta) for GitHub Pages; build/guide.min.html is the
# same content without the skeleton, for hosts that wrap the page themselves (claude.ai artifacts). test_local.html / test_min.html
# inline three.js from vendor/ so the automated tests run from file:// without the network.
import os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'build')
DOCS = os.path.join(ROOT, 'docs')
THREE_CDN = '<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>'
CUTS = ['m3d_ux.js', 'tw_coast.js', 'tw_tokyo.js', 'tw_hsr_a.js', 'tw_lvl.js', 'island_a.js', 'page.js']
SKEL_CSS = ':root{color-scheme:light;box-sizing:border-box}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}'
META = ('<meta name="description" content="オート化学工業（Auto Chemical）建築用防水、密封、接著產品的互動式產品指南：工法步驟、用量計算、文件產生、第一人稱施工模擬與「AUTO 台灣島」。繁體中文／English／日本語。">\n'
        '<meta name="theme-color" content="#f97b00">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:title" content="Auto Chemical in Taiwan by Good Startup">\n'
        '<meta property="og:site_name" content="Auto Chemical in Taiwan by Good Startup">\n'
        '<meta name="application-name" content="Auto Chemical in Taiwan by Good Startup">\n'
        '<meta name="apple-mobile-web-app-title" content="Auto Chemical in Taiwan by Good Startup">\n'
        '<meta property="og:description" content="工法步驟、用量計算、文件產生、第一人稱施工模擬與 AUTO 台灣島。">\n'
        '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2212%22 fill=%22%23f97b00%22/%3E%3Cpath d=%22M18 46 L32 16 L46 46 M24 36 H40%22 fill=%22none%22 stroke=%22%23fff%22 stroke-width=%227%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E">\n')


def read(p): return open(p, encoding='utf-8').read()


def assemble():
    order = [f for f in read(os.path.join(SRC, '_order.txt')).split('\n') if f]
    pre, post, boot = read(os.path.join(SRC, '_pre.html')), read(os.path.join(SRC, '_post.html')), read(os.path.join(SRC, '_boot.html'))
    fonts = '&display=swap">\n'
    assert pre.count(fonts) >= 1, 'the font link was not found in _pre.html'
    pre = pre.replace(fonts, fonts + boot, 1)
    pre = pre.replace(THREE_CDN, '<script>window.__boot&&__boot.at(0.025,1)</script>\n' + THREE_CDN, 1)
    parts = ['<script>window.__boot&&__boot.load(0)</script>\n<script>\n'] if pre.rstrip().endswith('<script>') else []
    k, acc, body = 0, [], []
    for f in order:
        code = read(os.path.join(SRC, f)); body.append(code)
        if f in CUTS:
            k += 1; acc.append('\n</script>\n<script>window.__boot&&__boot.load(%d)</script>\n<script>\n' % k)
        acc.append(code)
    split_body = ''.join(acc)
    if parts:
        pre = pre.rstrip()[:-len('<script>')]; split_body = parts[0] + split_body
    post = post + '\n<script>window.__boot&&__boot.loaded()</script>\n'
    for css in ('css_extra_add.css', 'css_final.css'):
        p = os.path.join(SRC, css)
        if os.path.exists(p):
            i = pre.rfind('\n</style>'); pre = pre[:i] + '\n' + read(p) + pre[i:]
    return pre + split_body + post, ''.join(body)


def terser():
    for c in ('terser', os.path.join(ROOT, 'node_modules', '.bin', 'terser')):
        if shutil.which(c) or os.path.exists(c): return [c]
    return ['npx', '--yes', 'terser']


def mini_js(code):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(code); src = f.name
    dst = src + '.min.js'
    r = subprocess.run(terser() + [src, '--comments', '/VOICEVOX|@license|MIT/', '--format', 'ascii_only=false,max_line_len=2000', '-o', dst], capture_output=True, text=True)
    if r.returncode != 0: raise SystemExit('terser failed: ' + r.stderr[:2000])
    out = read(dst); os.unlink(src); os.unlink(dst); return out


def mini_css(css):
    css = re.sub(r'/\*[\s\S]*?\*/', '', css); return re.sub(r'\n\s*\n+', '\n', css)


def minify(s):
    parts, out, last = [], [], 0
    for m in re.finditer(r'<script>([\s\S]*?)</script>', s):
        if len(m.group(1)) >= 20000: parts.append((m.start(1), m.end(1), m.group(1)))
    for a, b, body in parts:
        out.append(s[last:a]); out.append('\n' + mini_js(body) + '\n'); last = b
    out.append(s[last:]); s2 = ''.join(out)
    i0 = s2.find('<style>'); j0 = s2.find('</style>', i0); k0 = s2.find('<script')
    if i0 >= 0 and j0 > i0 and (k0 < 0 or i0 < k0): s2 = s2[:i0 + 7] + mini_css(s2[i0 + 7:j0]) + s2[j0:]
    return s2


def skeleton(content, inline_three):
    """the document round the page's content: the title and the font links go into the head, the rest stays as it is"""
    head_bits, body = [], content
    for _ in range(3):
        m = re.match(r'\s*(<title>[^<]*</title>|<link [^>]*>)\n', body)
        if not m: break
        head_bits.append(m.group(1)); body = body[m.end():]
    head_bits = [('<title>Auto Chemical in Taiwan by Good Startup</title>' if h.startswith('<title>') else h) for h in head_bits] # (v73) the same name the page keeps once it runs — what a bookmark is called
    if inline_three: body = body.replace(THREE_CDN, '<script>' + read(os.path.join(ROOT, 'vendor', 'three.min.js')) + '</script>')
    return ('<!doctype html>\n<html lang="zh-Hant-TW">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            + '\n'.join(head_bits) + '\n' + META + '<style>' + SKEL_CSS + '</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')


def build(docs_dir, out_dir):
    os.makedirs(out_dir, exist_ok=True); os.makedirs(docs_dir, exist_ok=True)
    full, body = assemble()
    open(os.path.join(out_dir, 'guide.html'), 'w', encoding='utf-8').write(full)
    open(os.path.join(out_dir, '_build_check.js'), 'w', encoding='utf-8').write(body)
    r = subprocess.run(['node', '--check', os.path.join(out_dir, '_build_check.js')], capture_output=True, text=True)
    if r.returncode != 0: raise SystemExit('the assembled code does not parse:\n' + r.stderr[:2000])
    mini = minify(full)
    open(os.path.join(out_dir, 'guide.min.html'), 'w', encoding='utf-8').write(mini)
    open(os.path.join(docs_dir, 'index.html'), 'w', encoding='utf-8').write(skeleton(mini, False))
    open(os.path.join(out_dir, 'test_local.html'), 'w', encoding='utf-8').write(skeleton(full, True))
    open(os.path.join(out_dir, 'test_min.html'), 'w', encoding='utf-8').write(skeleton(mini, True))
    print('build: guide.html %.2f MB, guide.min.html %.2f MB, docs/index.html %.2f MB' % (len(full.encode('utf-8')) / 1e6, len(mini.encode('utf-8')) / 1e6, os.path.getsize(os.path.join(docs_dir, 'index.html')) / 1e6))


if __name__ == '__main__':
    if '--check' in sys.argv:
        tmp = tempfile.mkdtemp(); build(os.path.join(tmp, 'docs'), os.path.join(tmp, 'build'))
        a, b = read(os.path.join(tmp, 'docs', 'index.html')), read(os.path.join(DOCS, 'index.html'))
        shutil.rmtree(tmp)
        if a != b: print('docs/index.html differs from a fresh build — run python3 build.py and commit'); sys.exit(1)
        print('docs/index.html is up to date')
    else:
        build(DOCS, OUT)
