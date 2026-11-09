"""Generates the Easy Beeper icon set from a vector definition.

Concept: a ring of ten dots (one per second of a 10-second cycle) on the app's
green; the dot at 12 o'clock is bigger and brighter — the long beep.
"""
import math
import os
import cairosvg

GREEN = "#2e8b57"
WHITE = "#ffffff"
OUT = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT, exist_ok=True)


def dots(cx, cy, ring_r, small_r, big_r, color, opacity_small=0.92):
    parts = []
    for i in range(10):
        a = math.radians(-90 + i * 36)
        x, y = cx + ring_r * math.cos(a), cy + ring_r * math.sin(a)
        r = big_r if i == 0 else small_r
        op = 1 if i == 0 else opacity_small
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{color}" opacity="{op}"/>')
    return "\n".join(parts)


def svg(size, body, bg=None):
    rect = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size}{" "}{size}">{rect}{body}</svg>'


def render(name, markup, width, height=None):
    path = os.path.join(OUT, name)
    cairosvg.svg2png(bytestring=markup.encode(), write_to=path, output_width=width, output_height=height or width)
    print("wrote", path)


S = 1024
C = S / 2

# Adaptive foreground: keep everything inside the 66% safe circle (r ≈ 338).
PLAY = lambda cx, cy, s, color: f'<polygon points="{cx-s*0.42:.1f},{cy-s*0.5:.1f} {cx-s*0.42:.1f},{cy+s*0.5:.1f} {cx+s*0.5:.1f},{cy:.1f}" fill="{color}" stroke="{color}" stroke-width="{s*0.18:.1f}" stroke-linejoin="round"/>'
fg_mark = dots(C, C, ring_r=250, small_r=38, big_r=70, color=WHITE) + PLAY(C, C, 150, WHITE)
render("android-icon-foreground.png", svg(S, fg_mark), S)
render("android-icon-monochrome.png", svg(S, dots(C, C, 250, 38, 70, WHITE, opacity_small=1) + PLAY(C, C, 150, WHITE)), S)
render("android-icon-background.png", svg(S, "", bg=GREEN), S)

# Legacy / iOS / Play Store icon: full-bleed square, mark scaled up (no safe-zone crop).
legacy_mark = dots(C, C, ring_r=310, small_r=46, big_r=86, color=WHITE) + PLAY(C, C, 185, WHITE)
render("icon.png", svg(S, legacy_mark, bg=GREEN), S)
render("play-store-icon-512.png", svg(S, legacy_mark, bg=GREEN), 512)
render("favicon.png", svg(S, legacy_mark, bg=GREEN), 48)

# Feature graphic 1024x500 for the Play listing.
W, H = 1024, 500
feature = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="{GREEN}"/>
  {dots(230, 250, 150, 22, 42, WHITE)}{PLAY(230, 250, 90, WHITE)}
  <text x="440" y="235" font-family="DejaVu Sans, Arial, sans-serif" font-size="76" font-weight="bold" fill="{WHITE}">Easy Beeper</text>
  <text x="442" y="305" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="{WHITE}" opacity="0.85">Interval beeps for holds and sets.</text>
  <text x="442" y="352" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="{WHITE}" opacity="0.85">Offline. No ads. Works while you film.</text>
</svg>'''
render("feature-graphic-1024x500.png", feature, W, H)

# Preview sheet: how the adaptive icon looks under circle and rounded-square masks.
preview = f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="320" viewBox="0 0 900 320">
  <rect width="900" height="320" fill="#1a1a1a"/>
  <defs>
    <clipPath id="circle"><circle cx="160" cy="160" r="120"/></clipPath>
    <clipPath id="squircle"><rect x="330" y="40" width="240" height="240" rx="60"/></clipPath>
  </defs>
  <g clip-path="url(#circle)"><rect x="40" y="40" width="240" height="240" fill="{GREEN}"/>
    <g transform="translate(40 40) scale({240/S})">{fg_mark}</g></g>
  <g clip-path="url(#squircle)"><rect x="330" y="40" width="240" height="240" fill="{GREEN}"/>
    <g transform="translate(330 40) scale({240/S})">{fg_mark}</g></g>
  <g transform="translate(620 40) scale({240/S})"><rect width="{S}" height="{S}" fill="{GREEN}"/>{legacy_mark}</g>
  <text x="160" y="305" text-anchor="middle" font-family="DejaVu Sans" font-size="16" fill="#aaa">adaptive · circle</text>
  <text x="450" y="305" text-anchor="middle" font-family="DejaVu Sans" font-size="16" fill="#aaa">adaptive · rounded</text>
  <text x="740" y="305" text-anchor="middle" font-family="DejaVu Sans" font-size="16" fill="#aaa">legacy / Play Store</text>
</svg>'''
render("preview.png", preview, 900, 320)
