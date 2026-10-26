"""Prepare the numbered entrance photos for the public walking guide.

The annotated *_箭頭.jpg files are visual references only.  The website draws
its own scalable arrows over the unmarked photos.
"""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "道路指引"
DESTINATION = ROOT / "dist" / "assets" / "directions"
ROUTES = {"kulun": ("庫倫街", 6), "oak": ("橡木桶", 8)}


def main() -> None:
    for slug, (folder, count) in ROUTES.items():
        output = DESTINATION / slug
        output.mkdir(parents=True, exist_ok=True)
        for number in range(1, count + 1):
            photo = SOURCE / folder / f"{number}.jpg"
            reference = SOURCE / folder / f"{number}_箭頭.jpg"
            if not photo.is_file() or not reference.is_file():
                raise FileNotFoundError(f"Missing photo/reference pair: {folder} {number}")
            with Image.open(photo) as original:
                upright = ImageOps.exif_transpose(original).convert("RGB")
                upright.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
                upright.save(output / f"{number}.webp", "WEBP", quality=82, method=6)
    print("Ready: 14 upright, unmarked route photos (6 Kulun Street, 8 Oak Barrel).")


if __name__ == "__main__":
    main()
