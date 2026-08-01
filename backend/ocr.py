import fitz
import pytesseract
from PIL import Image
import os

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text(file_path):

    ext = os.path.splitext(file_path)[1].lower()

    # PDF
    if ext == ".pdf":
        doc = fitz.open(file_path)

        text = ""

        for page in doc:
            text += page.get_text()

        doc.close()
        return text

    # Image
    elif ext in [".jpg", ".jpeg", ".png"]:

        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text

    else:
        return ""