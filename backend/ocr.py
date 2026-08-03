import fitz
import os

def extract_text(file_path):

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        doc = fitz.open(file_path)

        text = ""

        for page in doc:
            text += page.get_text()

        doc.close()
        return text

    return ""