from pathlib import Path
from datetime import datetime
from fractions import Fraction
from hashlib import sha256
import json

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

ROOT = Path(__file__).resolve().parent.parent

INPUT_DIR = ROOT / "original_photos"
OUTPUT_DIR = ROOT / "public" / "photography"

THUMB_DIR = OUTPUT_DIR / "thumbs"
FULL_DIR = OUTPUT_DIR / "full"

JSON_PATH = ROOT / "data" / "photos.generated.json"

THUMB_SIZE = 1000
THUMB_QUALITY = 78

FULL_SIZE = 2400
FULL_QUALITY = 88

SUPPORTED = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
    ".tif",
    ".tiff",
}


def text_value(value):
    """Convert EXIF text values to JSON-compatible strings."""
    if value is None:
        return None

    if isinstance(value, bytes):
        value = value.decode("utf-8", errors="replace")

    result = str(value).strip().strip("\x00")
    return result or None


def number_value(value):
    """Handle integer, float, and EXIF rational values."""
    try:
        if value is None:
            return None

        number = float(value)

        if not (-1e9 < number < 1e9):
            return None

        return number
    except (TypeError, ValueError, ZeroDivisionError, OverflowError):
        return None


def extract_date(exif):
    """Extract the shooting date without exporting the time."""
    value = text_value(exif.get(36867) or exif.get(306))

    if not value:
        return None

    try:
        return datetime.strptime(value[:10], "%Y:%m:%d").strftime("%Y-%m-%d")
    except ValueError:
        return None


def extract_exif(image):
    """Extract a whitelist of photographic fields without reading GPS."""
    try:
        exif = image.getexif()
    except Exception:
        return {}

    camera_make = text_value(exif.get(271))
    camera_model = text_value(exif.get(272))

    try:
        detail = exif.get_ifd(34665)
    except Exception:
        detail = {}

    def get_tag(tag):
        return detail.get(tag, exif.get(tag))

    lens = text_value(get_tag(42036))

    aperture = number_value(get_tag(33437))
    exposure = number_value(get_tag(33434))
    iso = number_value(get_tag(34855))
    focal = number_value(get_tag(37386))

    camera_parts = []

    if camera_make:
        camera_parts.append(camera_make)

    if camera_model:
        if not camera_make or not camera_model.lower().startswith(camera_make.lower()):
            camera_parts.append(camera_model)
        else:
            camera_parts = [camera_model]

    camera = " ".join(camera_parts) or None

    aperture_text = f"f/{aperture:g}" if aperture and aperture > 0 else None

    shutter_text = None

    if exposure and exposure > 0:
        if exposure >= 1:
            shutter_text = f"{exposure:g}s"
        else:
            fraction = Fraction(exposure).limit_denominator(8000)
            shutter_text = f"{fraction.numerator}/{fraction.denominator}s"

    focal_text = f"{focal:g}mm" if focal and focal > 0 else None

    return {
        "camera": camera,
        "lens": lens,
        "aperture": aperture_text,
        "shutter": shutter_text,
        "iso": round(iso) if iso and iso > 0 else None,
        "focalLength": focal_text,
        "date": extract_date(exif),
    }


def save_webp(image, output, max_size, quality):
    img = image.copy()
    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    has_alpha = "A" in img.getbands() or "transparency" in img.info
    img = img.convert("RGBA" if has_alpha else "RGB")

    img.save(output, format="WEBP", quality=quality, method=6)

    with Image.open(output) as check:
        if check.info.get("exif") or check.getexif():
            raise RuntimeError(f"Output image still contains EXIF: {output}")


def main():
    if not INPUT_DIR.is_dir():
        print(f"Original photo directory not found: {INPUT_DIR}")
        return

    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    FULL_DIR.mkdir(parents=True, exist_ok=True)
    JSON_PATH.parent.mkdir(parents=True, exist_ok=True)

    files = sorted(
        (
            path
            for path in INPUT_DIR.rglob("*")
            if path.is_file() and path.suffix.lower() in SUPPORTED
        ),
        key=lambda path: str(path.relative_to(INPUT_DIR)).lower(),
    )

    photos = []

    print(f"Found {len(files)} photos\n")

    for index, file in enumerate(files, 1):
        try:
            relative = file.relative_to(INPUT_DIR)
            digest = sha256(relative.as_posix().encode("utf-8")).hexdigest()[:12]

            filename = f"photo-{digest}.webp"
            thumb_path = THUMB_DIR / filename
            full_path = FULL_DIR / filename

            with Image.open(file) as original:
                metadata = extract_exif(original)
                image = ImageOps.exif_transpose(original)
                width, height = image.size

                save_webp(image, thumb_path, THUMB_SIZE, THUMB_QUALITY)
                save_webp(image, full_path, FULL_SIZE, FULL_QUALITY)

            photo = {
                "id": digest,
                "src": f"/photography/thumbs/{filename}",
                "fullSrc": f"/photography/full/{filename}",
                "title": file.stem,
                "location": "",
                "category": "Uncategorized",
                "width": width,
                "height": height,
                **metadata,
            }

            photos.append(photo)

            original_mb = file.stat().st_size / 1024**2
            thumb_mb = thumb_path.stat().st_size / 1024**2
            full_mb = full_path.stat().st_size / 1024**2

            print(
                f"[{index}/{len(files)}] {file.name}\n"
                f"  Original: {original_mb:.2f} MB\n"
                f"  Thumb: {thumb_mb:.2f} MB\n"
                f"  Full: {full_mb:.2f} MB\n"
                f"  EXIF: {metadata.get('camera') or 'Unknown camera'}\n"
            )

        except Exception as error:
            print(f"[Failed] {file.name}: {error}\n")

    JSON_PATH.write_text(
        json.dumps(photos, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("=" * 45)
    print(f"Successfully processed: {len(photos)}/{len(files)}")
    print(f"Photo directory: {OUTPUT_DIR}")
    print(f"JSON file: {JSON_PATH}")
    print("Published images contain no EXIF/GPS metadata")


if __name__ == "__main__":
    main()
