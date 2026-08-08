import fitz
import os
import shutil
from PIL import Image
import pytesseract


# =========================================================
# TESSERACT OCR CONFIGURATION
# =========================================================

# First try to find Tesseract from system PATH
tesseract_path = shutil.which("tesseract")

# If running on Windows and Tesseract is installed
# in the default location, use that path.
if not tesseract_path:

    windows_tesseract_path = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

    if os.path.exists(windows_tesseract_path):

        tesseract_path = windows_tesseract_path


# Set Tesseract path if found
if tesseract_path:

    pytesseract.pytesseract.tesseract_cmd = tesseract_path

    print(
        f"✅ Tesseract found: {tesseract_path}"
    )

else:

    print(
        "⚠ Tesseract executable not found. "
        "OCR may not work until Tesseract is installed."
    )


# =========================================================
# EXTRACT TEXT
# =========================================================

def extract_text(file_path):

    ext = os.path.splitext(
        file_path
    )[1].lower()


    # =====================================================
    # PDF
    # =====================================================

    if ext == ".pdf":

        try:

            doc = fitz.open(
                file_path
            )

            text = ""


            # -------------------------------------------------
            # First try normal PDF text extraction
            # -------------------------------------------------

            for page in doc:

                page_text = page.get_text()

                if page_text:

                    text += (
                        page_text
                        + "\n"
                    )


            # -------------------------------------------------
            # If normal text exists
            # -------------------------------------------------

            if text.strip():

                doc.close()

                print(
                    "✅ PDF text extracted successfully"
                )

                return text.strip()


            # -------------------------------------------------
            # Scanned PDF OCR
            # -------------------------------------------------

            print(
                "⚠ No text found. Starting PDF OCR..."
            )

            ocr_text = ""


            for page in doc:

                pix = page.get_pixmap(
                    matrix=fitz.Matrix(2, 2)
                )


                image = Image.frombytes(
                    "RGB",
                    [
                        pix.width,
                        pix.height
                    ],
                    pix.samples
                )


                page_text = pytesseract.image_to_string(
                    image
                )


                ocr_text += (
                    page_text
                    + "\n"
                )


            doc.close()


            print(
                "✅ Scanned PDF OCR completed"
            )


            return ocr_text.strip()


        except Exception as e:

            print(
                "❌ PDF Error:",
                e
            )

            return ""


    # =====================================================
    # IMAGE OCR
    # =====================================================

    elif ext in [
        ".jpg",
        ".jpeg",
        ".png"
    ]:

        try:

            image = Image.open(
                file_path
            )


            text = pytesseract.image_to_string(
                image
            )


            print(
                "✅ Image OCR completed"
            )


            return text.strip()


        except Exception as e:

            print(
                "❌ OCR Error:",
                e
            )

            return ""


    # =====================================================
    # UNSUPPORTED FILE
    # =====================================================

    else:

        print(
            "⚠ Unsupported file format"
        )

        return ""