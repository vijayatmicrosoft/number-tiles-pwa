"""Generate app icons for Number Tiles.

Renders a high-resolution master icon (a 2x2 grid of colorful numbered tiles on a
deep-navy rounded background) and downscales it to the sizes the PWA manifest uses.

Run:
    C:/Users/vijayreddy/AppData/Local/Programs/Python/Python312/python.exe generate_icons.py
"""

import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ICON_DIR = os.path.join(HERE, "assets", "icons")
os.makedirs(ICON_DIR, exist_ok=True)

MASTER = 1024  # render big, then downscale for crisp anti-aliased edges

# App palette
BG_TOP = (0x23, 0x23, 0x47)
BG_BOTTOM = (0x14, 0x1B, 0x30)
TILE_COLORS = [
    (0x4E, 0xCD, 0xC4),  # teal   -> 1
    (0x45, 0xB7, 0xD1),  # blue   -> 2
    (0x96, 0xCE, 0xB4),  # green  -> 3
    (0xFF, 0xEA, 0xA7),  # yellow -> 4
]
NUMBER_COLOR = (0x1A, 0x1A, 0x2E)
NUMBERS = ["1", "2", "3", "4"]


def _load_font(size):
    for name in ("segoeuib.ttf", "arialbd.ttf", "seguibl.ttf", "ariblk.ttf"):
        path = os.path.join("C:\\", "Windows", "Fonts", name)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def _vertical_gradient(size, top, bottom):
    grad = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / (size - 1)
        grad.putpixel(
            (0, y),
            (
                int(top[0] + (bottom[0] - top[0]) * t),
                int(top[1] + (bottom[1] - top[1]) * t),
                int(top[2] + (bottom[2] - top[2]) * t),
            ),
        )
    return grad.resize((size, size))


def build_master():
    img = Image.new("RGBA", (MASTER, MASTER), (0, 0, 0, 0))

    # Rounded navy background with a subtle vertical gradient.
    grad = _vertical_gradient(MASTER, BG_TOP, BG_BOTTOM).convert("RGBA")
    mask = Image.new("L", (MASTER, MASTER), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, MASTER - 1, MASTER - 1], radius=int(MASTER * 0.22), fill=255
    )
    img.paste(grad, (0, 0), mask)

    draw = ImageDraw.Draw(img)

    # 2x2 tile grid centered within the maskable safe zone (~66% of canvas).
    grid = int(MASTER * 0.66)
    gap = int(MASTER * 0.045)
    origin = (MASTER - grid) // 2
    cell = (grid - gap) // 2
    radius = int(cell * 0.24)
    font = _load_font(int(cell * 0.62))

    for i in range(4):
        row, col = divmod(i, 2)
        x = origin + col * (cell + gap)
        y = origin + row * (cell + gap)

        # Tile body.
        draw.rounded_rectangle([x, y, x + cell, y + cell], radius=radius, fill=TILE_COLORS[i])
        # Soft top highlight.
        hl = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
        ImageDraw.Draw(hl).rounded_rectangle(
            [0, 0, cell, int(cell * 0.5)], radius=radius, fill=(255, 255, 255, 40)
        )
        img.paste(hl, (x, y), hl)

        # Number, centered.
        num = NUMBERS[i]
        box = draw.textbbox((0, 0), num, font=font)
        tw, th = box[2] - box[0], box[3] - box[1]
        draw.text(
            (x + (cell - tw) / 2 - box[0], y + (cell - th) / 2 - box[1]),
            num,
            font=font,
            fill=NUMBER_COLOR,
        )

    return img


def main():
    master = build_master()
    outputs = {
        "icon-1024.png": 1024,
        "icon-512.png": 512,
        "icon-192.png": 192,
    }
    for name, size in outputs.items():
        resized = master.resize((size, size), Image.LANCZOS)
        # Flatten onto the navy background so non-maskable contexts look right.
        flat = Image.new("RGB", (size, size), BG_BOTTOM)
        flat.paste(resized, (0, 0), resized)
        flat.save(os.path.join(ICON_DIR, name), "PNG")
        print("wrote", name, f"({size}x{size})")

    print("SUCCESS: icons generated in", ICON_DIR)


if __name__ == "__main__":
    main()
