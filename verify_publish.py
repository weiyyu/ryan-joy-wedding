"""Check the static wedding site before uploading it to GitHub Pages."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys


SITE = Path(__file__).resolve().parent / "dist"
ERRORS: list[str] = []


class SiteHTML(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[str] = []
        self.maps_links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for key in ("href", "src", "poster"):
            value = values.get(key)
            if value:
                self.references.append(value)
                if value.startswith("https://www.google.com/maps/"):
                    self.maps_links.append(value)


def check_path(reference: str, source: Path) -> None:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return
    if parsed.path.startswith("/"):
        ERRORS.append(f"{source.name}: root-relative URL breaks project Pages: {reference}")
        return
    target = (source.parent / unquote(parsed.path)).resolve()
    if not target.is_relative_to(SITE):
        ERRORS.append(f"{source.name}: URL leaves dist/: {reference}")
        return
    if not target.is_file():
        ERRORS.append(f"{source.name}: missing file: {reference}")
        return
    cursor = SITE
    for part in target.relative_to(SITE).parts:
        names = {entry.name for entry in cursor.iterdir()}
        if part not in names:
            ERRORS.append(f"{source.name}: filename case mismatch: {reference}")
            return
        cursor /= part


def main() -> int:
    if not (SITE / "index.html").is_file():
        ERRORS.append("dist/index.html is missing")

    map_urls: dict[str, list[str]] = {}
    for html in sorted(SITE.glob("*.html")):
        parser = SiteHTML()
        parser.feed(html.read_text(encoding="utf-8"))
        for reference in parser.references:
            check_path(reference, html)
        map_urls[html.name] = parser.maps_links

    for css in SITE.glob("*.css"):
        for reference in re.findall(r"url\(\s*['\"]?([^'\")]+)", css.read_text(encoding="utf-8")):
            if not reference.startswith(("data:", "%23", "#")):
                check_path(reference, css)

    gallery_source = (SITE / "gallery.js").read_text(encoding="utf-8")
    photo_ids = re.findall(r'^\s*\["(\d{4})",', gallery_source, re.MULTILINE)
    if len(photo_ids) != 26 or len(set(photo_ids)) != 26:
        ERRORS.append(f"gallery.js: expected 26 distinct photos, found {len(photo_ids)}")
    for photo_id in photo_ids:
        for folder in ("gallery", "gallery/thumbs"):
            check_path(f"./assets/{folder}/Y25836-{photo_id}.webp", SITE / "gallery.js")

    if not map_urls.get("index.html") or map_urls.get("index.html") != map_urls.get("schedule.html"):
        ERRORS.append("Homepage and schedule use different church map URLs")

    files = [path for path in SITE.rglob("*") if path.is_file()]
    allowed_suffixes = {".html", ".css", ".js", ".svg", ".webp"}
    for path in files:
        if path.suffix.lower() not in allowed_suffixes:
            ERRORS.append(f"Unexpected file in public site: {path.relative_to(SITE)}")
    oversized = [path for path in files if path.stat().st_size > 25 * 1024 * 1024]
    for path in oversized:
        ERRORS.append(f"File is over GitHub's 25 MiB browser-upload limit: {path.relative_to(SITE)}")

    if ERRORS:
        for error in ERRORS:
            print("ERROR:", error, file=sys.stderr)
        return 1
    total = sum(path.stat().st_size for path in files)
    print(f"OK: {len(files)} publishable files, {total / 1024 / 1024:.2f} MiB, {len(photo_ids)} album photos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
