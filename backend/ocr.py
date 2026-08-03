import fitz
import os
from PIL import Image
import pytesseract


def extract_text(file_path):

    ext = os.path.splitext(file_path)[1].lower()

    # PDF
    if ext == ".pdf":
        try:
            doc = fitz.open(file_path)

            text = ""

            for page in doc:
                text += page.get_text()

            doc.close()

            return text.strip()

        except Exception as e:
            print("PDF Error:", e)
            return ""

    # Image
    elif ext in [".jpg", ".jpeg", ".png"]:
        try:
            image = Image.open(file_path)

            text = pytesseract.image_to_string(image)

            return text.strip()

        except Exception as e:
            print("OCR Error:", e)
            return ""

    # Unsupported File
    else:
        return ""