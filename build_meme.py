#!/usr/bin/env python3
"""Build the GTA 6 meme for gta6-meme-x-01 (@0xredzone).

Base image: AI-generated Vice City scene with the make.fun ghost mascot.
Adds classic meme top/bottom text (white, black outline) and the official
make.fun lockup (on-dark) as a corner brand stamp.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

BASE = "media-generation-meme-base-0-ddb6b0f2-68c6-4f26-8981-8a1687628696.webp"
LOCKUP = "press-kit/make-fun-press-kit/lockup-on-dark-2400.png"
OUT = "meme.png"

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

img = Image.open(BASE).convert("RGB")
w, h = img.size
print(f"base: {w}x{h}")
draw = ImageDraw.Draw(img)


def fit_font(text, max_w, start_size):
    size = start_size
    while size > 20:
        f = ImageFont.truetype(FONT_BOLD, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(FONT_BOLD, size)


def draw_centered(text, y, font, stroke):
    tw = draw.textlength(text, font=font)
    draw.text(((w - tw) / 2, y), text, font=font, fill="white",
              stroke_width=stroke, stroke_fill="black")


# Top text
top = "WAITED 12 YEARS FOR GTA 6"
f_top = fit_font(top, w * 0.92, 130)
draw_centered(top, 36, f_top, max(4, f_top.size // 14))

# Bottom text (two lines), kept above the lockup zone
bot1 = "MY AGENT ALREADY MADE $500"
bot2 = "ON MAKE.FUN"
f_bot = fit_font(bot1, w * 0.92, 110)
stroke = max(4, f_bot.size // 14)
line_h = int(f_bot.size * 1.15)
y2 = h - 36 - line_h          # bottom line baseline area
y1 = y2 - line_h
draw_centered(bot1, y1, f_bot, stroke)
draw_centered(bot2, y2, f_bot, stroke)

# Official lockup, bottom-right corner
lock = Image.open(LOCKUP).convert("RGBA")
lw_target = 300
scale = lw_target / lock.width
lock = lock.resize((lw_target, int(lock.height * scale)), Image.LANCZOS)
img.paste(lock, (w - lw_target - 28, h - lock.height - 24), lock)

img.save(OUT, "PNG")
print(f"saved {OUT}: {img.size}")
