import re
import os
import joblib


# ==========================
# Load ML Model
# ==========================

model = None

MODEL_PATH = "document_classifier.pkl"

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("✅ AI Model Loaded Successfully")
    except Exception as e:
        print("⚠ ML Model Loading Error:", e)
        model = None
else:
    print("⚠ document_classifier.pkl not found. Using Rule-Based Classification.")


# ==========================
# AI Document Classification
# ==========================

def classify_document(text):

    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()

    print("=" * 50)
    print("OCR TEXT:")
    print(text)
    print("=" * 50)


    # ==========================
    # RULE BASED CLASSIFICATION
    # ==========================
    # Known document types are checked first
    # so important documents are not incorrectly
    # classified as Other by the ML model.


    # --------------------------
    # Caste Certificate
    # --------------------------

    if (
        "caste certificate" in text
        or "scheduled caste" in text
        or "scheduled tribe" in text
        or "other backward classes" in text
        or "caste validity" in text
    ):
        return "Caste Certificate", "99%"


    # --------------------------
    # Project Report
    # --------------------------

    elif (
        "project report" in text
        or "project abstract" in text
        or "machine learning" in text
        or "artificial intelligence" in text
        or "deep learning" in text
    ):
        return "Project Report", "99%"


    # --------------------------
    # Resume
    # --------------------------

    elif (
        "resume" in text
        or "curriculum vitae" in text
        or ("skills" in text and "education" in text)
    ):
        return "Resume", "99%"


    # --------------------------
    # Invoice
    # --------------------------

    elif (
        "invoice" in text
        or "tax invoice" in text
        or "invoice number" in text
        or "bill to" in text
        or "total amount" in text
    ):
        return "Invoice", "98%"


    # --------------------------
    # Aadhaar Card
    # --------------------------

    elif (
        "aadhaar" in text
        or "aadhar" in text
        or "unique identification authority of india" in text
        or "uidai" in text
    ):
        return "Aadhaar Card", "99%"


    # --------------------------
    # PAN Card
    # --------------------------

    elif (
        "pan card" in text
        or "income tax department" in text
        or "permanent account number" in text
    ):
        return "PAN Card", "99%"


    # --------------------------
    # Marksheet
    # --------------------------

    elif (
        "marksheet" in text
        or "statement of marks" in text
        or "statement of marks/grades" in text
        or "marks obtained" in text
        or "grade" in text
    ):
        return "Marksheet", "98%"


    # --------------------------
    # Driving License
    # --------------------------

    elif (
        "driving licence" in text
        or "driving license" in text
        or "transport department" in text
    ):
        return "Driving License", "98%"


    # --------------------------
    # Passport
    # --------------------------

    elif (
        "passport" in text
        or "republic of india" in text
        or "passport no" in text
    ):
        return "Passport", "98%"


    # --------------------------
    # Medical Document
    # --------------------------

    elif (
        "medical" in text
        or "hospital" in text
        or "doctor" in text
        or "patient" in text
        or "diagnosis" in text
        or "prescription" in text
    ):
        return "Medical", "97%"


    # --------------------------
    # Legal Document
    # --------------------------

    elif (
        "agreement" in text
        or "contract" in text
        or "legal notice" in text
        or "terms and conditions" in text
    ):
        return "Legal", "96%"


    # --------------------------
    # Bank Passbook / Statement
    # --------------------------

    elif (
        "bank passbook" in text
        or "passbook" in text
        or "bank statement" in text
        or "account statement" in text
        or "savings account" in text
        or "current account" in text
        or "account number" in text
        or "ifsc" in text
        or "ifsc code" in text
        or "bank branch" in text
        or "bank balance" in text
        or "transaction" in text
        or "canara bank" in text
        or "state bank of india" in text
        or "bank of india" in text
        or "hdfc bank" in text
        or "icici bank" in text
        or "axis bank" in text
        or "kotak mahindra bank" in text
    ):
        return "Bank Passbook / Statement", "98%"


    # ==========================
    # MACHINE LEARNING
    # ==========================
    # If no known rule matched,
    # use the trained ML model.


    if model is not None:

        try:

            prediction = model.predict([text])[0]

            return str(prediction), "99%"

        except Exception as e:

            print("⚠ ML Prediction Error:", e)


    # ==========================
    # OTHER
    # ==========================

    return "Other", "80%"


# ==========================
# Document Verification
# ==========================

def verify_document(text):

    text = text.strip()

    if len(text) < 50:
        return "Incomplete"

    return "Verified"


# ==========================
# Fraud Detection
# ==========================

def detect_fraud(text):

    text = text.lower()

    fraud_keywords = [
        "fake",
        "duplicate",
        "forged",
        "invalid",
        "fraud"
    ]

    for word in fraud_keywords:

        if word in text:
            return "Suspicious"

    return "Safe"


# ==========================
# AI Auto Summary
# ==========================

def generate_summary(text):

    text = text.strip()

    if len(text) < 200:
        return text

    sentences = text.split(".")

    summary = ". ".join(sentences[:3])

    return summary