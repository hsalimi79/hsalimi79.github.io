#!/usr/bin/env python3
"""Generate the two language versions of the site from index.html.

index.html is the single source of truth. Every translatable element carries
data-en / data-fa attributes. This script writes:

  index.html     -> Persian (default, served at /)
  en/index.html  -> English (served at /en/)

with the static text, <html lang/dir>, title, description, canonical and
hreflang links already in the right language (so it also works without JS and
for search engines). It is idempotent: run it after every edit to index.html.

    python3 tools/build_lang.py
"""
import html, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
SITE = "https://" + (ROOT / "CNAME").read_text().strip()

META = {
    "fa": {
        "title": "حسین سلیمی — وب‌سایت، اپلیکیشن و ربات برای کسب‌وکار شما",
        "desc": "حسین سلیمی، توسعه‌دهنده فول‌استک. سایت، اپلیکیشن اندروید، ربات تلگرام و بله و داشبورد مدیریت می‌سازم؛ از ایده‌ی اول تا محصول زنده.",
        "ogdesc": "سایت، اپلیکیشن اندروید، ربات تلگرام و بله و داشبورد مدیریت؛ از ایده‌ی اول تا محصول زنده.",
        "locale": "fa_IR",
    },
    "en": {
        "title": "Hossein Salimi — Websites, Apps & Bots for your business",
        "desc": "Hossein Salimi — Full Stack Developer. I build websites, Android apps, Telegram and Bale bots and dashboards for businesses, from idea to launch.",
        "ogdesc": "Websites, Android apps, Telegram and Bale bots and dashboards, from the first idea to a live product.",
        "locale": "en_US",
    },
}

TAG = re.compile(r'<(\w+)((?:\s+[\w:-]+(?:="[^"]*"|=\'[^\']*\')?)*)\s*/?>')
ATTR = re.compile(r'\sdata-(en|fa)=("([^"]*)"|\'([^\']*)\')')


def localize(src: str, lang: str) -> str:
    out, last = [], 0
    pos = 0
    while True:
        m = TAG.search(src, pos)
        if not m:
            break
        pos = m.end()
        vals = {k: (a or b) for k, _, a, b in ATTR.findall(m.group(2))}
        if lang not in vals:
            continue
        name = m.group(1)
        depth, scan, end = 1, m.end(), None
        for t in re.finditer(r'<(/?)%s\b(?:[^>"\']|"[^"]*"|\'[^\']*\')*>' % name, src[m.end():]):
            depth += -1 if t.group(1) else 1
            if depth == 0:
                end = m.end() + t.start()
                break
        if end is None:
            continue
        out.append(src[last:m.end()])
        out.append(vals[lang])
        last = end
        pos = end
    out.append(src[last:])
    return "".join(out)


def build(src: str, lang: str) -> str:
    s = localize(src, lang)
    rtl = lang == "fa"
    meta = META[lang]
    s = re.sub(r'<html lang="\w+" dir="\w+">', f'<html lang="{lang}" dir="{"rtl" if rtl else "ltr"}">', s, count=1)
    s = re.sub(r'<body( class="[^"]*")?>', '<body class="fa">' if rtl else '<body>', s, count=1)
    s = re.sub(r"<title>.*?</title>", f"<title>{meta['title']}</title>", s, count=1, flags=re.S)
    s = re.sub(r'(<meta name="description" content=)"[^"]*"', rf'\1"{meta["desc"]}"', s, count=1)
    s = re.sub(r'(<meta property="og:title" content=)"[^"]*"', rf'\1"{meta["title"]}"', s, count=1)
    s = re.sub(r'(<meta property="og:description" content=)"[^"]*"', rf'\1"{meta["ogdesc"]}"', s, count=1)
    # canonical / hreflang / locale block
    s = re.sub(r'\n?<!-- lang:start -->.*?<!-- lang:end -->', '', s, flags=re.S)
    url = SITE + ("/" if rtl else "/en/")
    block = (
        '\n<!-- lang:start -->\n'
        f'<link rel="canonical" href="{url}">\n'
        f'<link rel="alternate" hreflang="fa" href="{SITE}/">\n'
        f'<link rel="alternate" hreflang="en" href="{SITE}/en/">\n'
        f'<link rel="alternate" hreflang="x-default" href="{SITE}/">\n'
        f'<meta property="og:url" content="{url}">\n'
        f'<meta property="og:locale" content="{meta["locale"]}">\n'
        '<!-- lang:end -->'
    )
    s = s.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="website">' + block, 1)
    # language switch link (a real link, no JS needed)
    target, label = ("en/", "EN") if rtl else ("../", "FA")
    s = re.sub(r'<a class="langbtn" id="lang"[^>]*>.*?</a>',
               f'<a class="langbtn" id="lang" href="{target}" hreflang="{"en" if rtl else "fa"}" lang="{"en" if rtl else "fa"}" '
               f'aria-label="{"English version" if rtl else "نسخه فارسی"}">{label}</a>', s, count=1, flags=re.S)
    if not rtl:  # /en/ lives one level down
        s = re.sub(r'((?:src|srcset|data-image|href)=")images/', r'\1../images/', s)
        s = re.sub(r'(srcset="[^"]*?), images/', r'\1, ../images/', s)
        s = s.replace(' images/', ' ../images/') if 'srcset' in s else s
    return s


def main():
    src = SRC.read_text(encoding="utf-8")
    fa = build(src, "fa")
    en = build(src, "en")
    # srcset lists use "images/a.webp 1440w, images/a@2x.webp 2880w"
    en = re.sub(r'(srcset="[^"]*)"', lambda m: m.group(1).replace('images/', '../images/').replace('../../images/', '../images/') + '"', en)
    en = en.replace('../../images/', '../images/')
    SRC.write_text(fa, encoding="utf-8")
    (ROOT / "en").mkdir(exist_ok=True)
    (ROOT / "en" / "index.html").write_text(en, encoding="utf-8")
    print("wrote index.html (fa) and en/index.html (en)")


if __name__ == "__main__":
    sys.exit(main())
