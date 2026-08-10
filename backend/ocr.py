import fitz
import os
import shutil

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import pytesseract


# =========================================================
# TESSERACT OCR CONFIGURATION
# =========================================================

# First check environment variable
tesseract_path = os.getenv("TESSERACT_CMD")


# Second check system PATH
if not tesseract_path:
    tesseract_path = shutil.which("tesseract")


# Third: Linux / Render path
if not tesseract_path and os.path.exists("/usr/bin/tesseract"):
    tesseract_path = "/usr/bin/tesseract"


# Fourth: Windows path
if not tesseract_path and os.name == "nt":

    windows_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
    ]

    for path in windows_paths:

        if os.path.exists(path):

            tesseract_path = path
            break


# Configure Tesseract
if tesseract_path:

    pytesseract.pytesseract.tesseract_cmd = tesseract_path

    print(
        f"✅ Tesseract found: {tesseract_path}"
    )

else:

    print(
        "❌ Tesseract executable not found."
    )

    print(
        "⚠ OCR for scanned documents/images may not work."
    )


# =========================================================
# IMAGE PREPROCESSING
# =========================================================

def preprocess_image(image):

    try:

        # Convert to RGB
        if image.mode != "RGB":

            image = image.convert("RGB")


        # Increase image size
        width, height = image.size

        if width < 1800:

            scale = 2

            image = image.resize(
                (
                    width * scale,
                    height * scale
                ),
                Image.Resampling.LANCZOS
            )


        # Grayscale
        gray = ImageOps.grayscale(image)


        # Auto contrast
        gray = ImageOps.autocontrast(gray)


        # Increase contrast
        contrast = ImageEnhance.Contrast(gray)

        gray = contrast.enhance(2.0)


        # Sharpen
        gray = gray.filter(
            ImageFilter.SHARPEN
        )


        # Threshold
        threshold = 160

        processed = gray.point(
            lambda pixel:
            255 if pixel > threshold
            else 0
        )


        return processed


    except Exception as e:

        print(
            "⚠ Image preprocessing error:",
            e
        )

        return image


# =========================================================
# OCR FUNCTION
# =========================================================

def perform_ocr(image):

    if not tesseract_path:

        print(
            "❌ Tesseract is not available."
        )

        return ""


    try:

        # Preprocess image
        processed_image = preprocess_image(image)


        # OCR configuration
        config = "--oem 3 --psm 6"


        # First OCR attempt
        text = pytesseract.image_to_string(
            processed_image,
            config=config
        )


        # Try original image if little text found
        if len(text.strip()) < 10:

            print(
                "⚠ Preprocessed OCR produced little text."
            )

            print(
                "🔄 Trying original image..."
            )

            original_text = pytesseract.image_to_string(
                image,
                config=config
            )


            if len(original_text.strip()) > len(text.strip()):

                text = original_text


        return text.strip()


    except Exception as e:

        print(
            "❌ OCR processing error:",
            e
        )

        return ""


# =========================================================
# EXTRACT TEXT FUNCTION
# =========================================================

def extract_text(file_path):

    # Check file exists
    if not os.path.exists(file_path):

        print(
            f"❌ File not found: {file_path}"
        )

        return ""


    # Get extension
    ext = os.path.splitext(
        file_path
    )[1].lower()


    # =====================================================
    # PDF PROCESSING
    # =====================================================

    if ext == ".pdf":

        try:

            doc = fitz.open(file_path)

            text = ""


            # Normal PDF text extraction
            for page in doc:

                page_text = page.get_text()

                if page_text:

                    text += (
                        page_text
                        + "\n"
                    )


            # If selectable text exists
            if text.strip():

                doc.close()

                print(
                    "✅ PDF text extracted successfully"
                )

                return text.strip()


            # Scanned PDF
            print(
                "⚠ No selectable text found."
            )

            print(
                "🔍 Starting enhanced PDF OCR..."
            )


            if not tesseract_path:

                doc.close()

                print(
                    "❌ Tesseract is not available."
                )

                return ""


            ocr_text = ""


            # OCR each page
            for page_number, page in enumerate(
                doc,
                start=1
            ):

                print(
                    f"🔍 OCR processing page {page_number}..."
                )


                # High resolution rendering
                pix = page.get_pixmap(
                    matrix=fitz.Matrix(
                        3,
                        3
                    ),
                    alpha=False
                )


                image = Image.frombytes(
                    "RGB",
                    [
                        pix.width,
                        pix.height
                    ],
                    pix.samples
                )


                page_text = perform_ocr(
                    image
                )


                ocr_text += (
                    page_text
                    + "\n"
                )


            doc.close()


            print(
                "✅ Enhanced scanned PDF OCR completed"
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

            if not tesseract_path:

                print(
                    "❌ Tesseract is not available."
                )

                return ""


            # Open image
            image = Image.open(
                file_path
            )


            print(
                f"📐 Original image size: {image.size}"
            )


            # OCR
            text = perform_ocr(
                image
            )


            if text.strip():

                print(
                    "✅ Enhanced Image OCR completed"
                )

                print(
                    f"📝 Extracted characters: {len(text)}"
                )

            else:

                print(
                    "⚠ No readable text detected."
                )


            return text.strip()


        except Exception as e:

            print(
                "❌ Image OCR Error:",
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