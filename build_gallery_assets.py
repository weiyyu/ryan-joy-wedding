"""Create web-sized album photos from the original wedding portraits."""

from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "婚紗照"
OUTPUT = ROOT / "wedding-site" / "dist" / "assets" / "gallery"
THUMBS = OUTPUT / "thumbs"


def save_webp(source: Path, destination: Path, maximum: int, quality: int) -> None:
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((maximum, maximum), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    THUMBS.mkdir(parents=True, exist_ok=True)
    photos = sorted(path for path in SOURCE.glob("*.jpg") if "複製" not in path.name)
    for photo in photos:
        name = photo.stem + ".webp"
        save_webp(photo, OUTPUT / name, 1900, 82)
        save_webp(photo, THUMBS / name, 320, 70)
        print(name, flush=True)

    sticker = ROOT / "婚紗照Q版" / "幸福相擁的婚禮Q版新人.png"
    with Image.open(sticker) as original:
        image = ImageOps.exif_transpose(original).convert("RGBA")
        image.thumbnail((650, 650), Image.Resampling.LANCZOS)
        image.save(OUTPUT / "album-sticker.webp", "WEBP", quality=82, method=6)
    print(f"{len(photos)} unique photos and one illustration ready", flush=True)


if __name__ == "__main__":
    main()
