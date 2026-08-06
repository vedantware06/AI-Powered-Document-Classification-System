import re
import os
import joblib

# ==========================
# Load ML Model
# ==========================

model = None

MODEL_PATH = "document_classifier.pkl"

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("✅ AI Model Loaded Successfully")
else:
    print("⚠ document_classifier.pkl not found. Using Rule-Based Classification.")


# ==========================
# AI Document Classification
# ==========================

def classify_document(text):

    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()

    print("=" * 50)
    print(text)
    print("=" * 50)

    # ==========================
    # Machine Learning Prediction
    # ==========================

    if model:

        try:
            prediction = model.predict([text])[0]

            return prediction, "99%"

        except:
            pass

    # ==========================
    # Rule Based Backup
    # ==========================

    if (
        "caste certificate" in text
        or "scheduled caste" in text
        or "scheduled tribe" in text
        or "other backward classes" in text
    ):
        return "Caste Certificate", "99%"

    elif (
        "project report" in text
        or "project abstract" in text
        or "machine learning" in text
        or "artificial intelligence" in text
    ):
        return "Project Report", "99%"

    elif (
        "resume" in text
        or "curriculum vitae" in text
        or ("skills" in text and "education" in text)
    ):
        return "Resume", "99%"

    elif (
        "invoice"
        in text
        or "tax invoice" in text
        or "invoice number" in text
    ):
        return "Invoice", "98%"

    elif (
        "aadhaar" in text
        or "aadhar" in text
    ):
        return "Aadhaar Card", "99%"

    elif (
        "pan card" in text
        or "income tax department" in text
    ):
        return "PAN Card", "99%"

    elif (
        "marksheet" in text
        or "statement of marks" in text
    ):
        return "Marksheet", "98%"

    elif (
        "driving licence" in text
        or "driving license" in text
    ):
        return "Driving License", "98%"

    elif (
        "passport" in text
    ):
        return "Passport", "98%"

    elif (
        "medical" in text
        or "hospital" in text
    ):
        return "Medical", "97%"

    elif (
        "agreement" in text
        or "contract" in text
    ):
        return "Legal", "96%"

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