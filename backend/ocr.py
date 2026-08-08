import fitz
import os
import shutil
from PIL import Image
import pytesseract


# =========================================================
# TESSERACT OCR CONFIGURATION
# =========================================================

# ---------------------------------------------------------
# 1. Check TESSERACT_CMD environment variable
# ---------------------------------------------------------

tesseract_path = os.getenv("TESSERACT_CMD")


# ---------------------------------------------------------
# 2. If environment variable is not available,
#    search Tesseract from system PATH
# ---------------------------------------------------------

if not tesseract_path:

    tesseract_path = shutil.which("tesseract")


# ---------------------------------------------------------
# 3. Windows default Tesseract location
# ---------------------------------------------------------

if not tesseract_path and os.name == "nt":

    windows_tesseract_path = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

    if os.path.exists(windows_tesseract_path):

        tesseract_path = windows_tesseract_path


# ---------------------------------------------------------
# 4. Configure Tesseract
# ---------------------------------------------------------

if tesseract_path:

    pytesseract.pytesseract.tesseract_cmd = tesseract_path

    print(
        f"✅ Tesseract found: {tesseract_path}"
    )

else:

    print(
        "⚠ Tesseract executable not found."
    )

    print(
        "⚠ Normal PDF text extraction will still work."
    )

    print(
        "⚠ OCR for scanned documents/images may not work."
    )


# =========================================================
# EXTRACT TEXT FUNCTION
# =========================================================

def extract_text(file_path):

    # -----------------------------------------------------
    # Check file exists
    # -----------------------------------------------------

    if not os.path.exists(file_path):

        print(
            f"❌ File not found: {file_path}"
        )

        return ""


    # -----------------------------------------------------
    # Get file extension
    # -----------------------------------------------------

    ext = os.path.splitext(
        file_path
    )[1].lower()


    # =====================================================
    # PDF PROCESSING
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
            # If normal PDF text exists
            # -------------------------------------------------

            if text.strip():

                doc.close()

                print(
                    "✅ PDF text extracted successfully"
                )

                return text.strip()


            # -------------------------------------------------
            # Scanned PDF
            # -------------------------------------------------

            print(
                "⚠ No selectable text found."
            )

            print(
                "🔍 Starting PDF OCR..."
            )


            # -------------------------------------------------
            # Check whether Tesseract is available
            # -------------------------------------------------

            if not tesseract_path:

                doc.close()

                print(
                    "❌ Tesseract is not available."
                )

                return ""


            ocr_text = ""


            # -------------------------------------------------
            # OCR each PDF page
            # -------------------------------------------------

            for page_number, page in enumerate(
                doc,
                start=1
            ):

                print(
                    f"🔍 OCR processing page {page_number}..."
                )


                pix = page.get_pixmap(
                    matrix=fitz.Matrix(
                        2,
                        2
                    )
                )


                image = Image.frombytes(
                    "RGB",
                    [
                        pix.width,
                        pix.height
                    ],
                    pix.samples
                )


                page_text = (
                    pytesseract.image_to_string(
                        image
                    )
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

            # -------------------------------------------------
            # Check Tesseract
            # -------------------------------------------------

            if not tesseract_path:

                print(
                    "❌ Tesseract is not available."
                )

                return ""


            # -------------------------------------------------
            # Open image
            # -------------------------------------------------

            image = Image.open(
                file_path
            )


            # -------------------------------------------------
            # Convert image to RGB
            # -------------------------------------------------

            if image.mode != "RGB":

                image = image.convert(
                    "RGB"
                )


            # -------------------------------------------------
            # OCR
            # -------------------------------------------------

            text = (
                pytesseract.image_to_string(
                    image
                )
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
            f"⚠ Unsupported file format: {ext}"
        )

        return ""