from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
PAGES = ROOT / "pages"


def page(number: int, color: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", (900, 1200), color)
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default(size=52)
    draw.rounded_rectangle((70, 70, 830, 1130), radius=35, outline="white", width=12)
    draw.text((450, 500), f"TEST PAGE {number}", fill="white", font=font, anchor="mm")
    draw.text((450, 580), "OnePanel manual fixture", fill="white", anchor="mm")
    return image


def main() -> None:
    ROOT.mkdir(exist_ok=True)
    PAGES.mkdir(exist_ok=True)
    colors = [(36, 99, 235), (220, 38, 38), (22, 163, 74)]
    pages = [page(index, color) for index, color in enumerate(colors, 1)]

    for index, image in enumerate(pages, 1):
        image.save(PAGES / f"{index:02}.png")

    formats = {
        "sample.bmp": "BMP",
        "sample.gif": "GIF",
        "sample.jpeg": "JPEG",
        "sample.jpg": "JPEG",
        "sample.png": "PNG",
        "sample.tif": "TIFF",
        "sample.tiff": "TIFF",
        "sample.webp": "WEBP",
    }
    for filename, image_format in formats.items():
        pages[0].save(ROOT / filename, format=image_format)

    for filename in ("sample.cbz", "sample.zip"):
        with ZipFile(ROOT / filename, "w", ZIP_DEFLATED) as archive:
            for source in sorted(PAGES.glob("*.png")):
                archive.write(source, source.name)

    pdf = canvas.Canvas(str(ROOT / "sample.pdf"), pagesize=A4)
    width, height = A4
    for index, color in enumerate(colors, 1):
        pdf.setFillColorRGB(*(channel / 255 for channel in color))
        pdf.rect(0, 0, width, height, stroke=0, fill=1)
        pdf.setFillColorRGB(1, 1, 1)
        pdf.setFont("Helvetica-Bold", 32)
        pdf.drawCentredString(width / 2, height / 2, f"TEST PAGE {index}")
        pdf.setFont("Helvetica", 15)
        pdf.drawCentredString(width / 2, height / 2 - 30, "OnePanel manual fixture")
        pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    main()
