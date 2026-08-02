import re


def classify_document(text):

    # Convert lowercase
    text = text.lower()

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()


    # Debug
    print("=" * 50)
    print(text)
    print("=" * 50)



    # ==========================
    # Caste Certificate
    # ==========================
    if (
        "caste certificate" in text
        or "form of caste certificate" in text
        or "other backward classes" in text
        or "scheduled caste" in text
        or "scheduled tribe" in text
        or "nomadic tribes" in text
        or "vimukta jati" in text
        or "special backward class" in text
    ):
        return "Caste Certificate", "99%"



    # ==========================
    # Project Report
    # ==========================
    elif (
        "project report" in text
        or "project abstract" in text
        or "technical project" in text
        or "industry visit" in text
        or "executive summary" in text
        or "core objective" in text
        or "workflow" in text
        or "artificial intelligence" in text
        or "machine learning" in text
        or "nlp" in text
        or "final year project" in text
        or "prepared by" in text
        or "academic level" in text
        or "technical specification" in text
    ):
        return "Project Report", "99%"



    # ==========================
    # Resume
    # ==========================
    elif (
        "resume" in text
        or "curriculum vitae" in text
        or ("skills" in text and "education" in text)
        or "experience" in text
    ):
        return "Resume", "99%"



    # ==========================
    # Invoice
    # ==========================
    elif (
        "invoice number" in text
        or "invoice no" in text
        or "tax invoice" in text
        or "gst invoice" in text
        or "total amount" in text
        or "amount payable" in text
        or "billing address" in text
    ):
        return "Invoice", "98%"



    # ==========================
    # Aadhaar Card
    # ==========================
    elif (
        "aadhaar" in text
        or "aadhar" in text
        or "unique identification authority of india" in text
    ):
        return "Aadhaar Card", "99%"



    # ==========================
    # PAN Card
    # ==========================
    elif (
        "permanent account number" in text
        or "income tax department" in text
        or "pan card" in text
    ):
        return "PAN Card", "99%"



    # ==========================
    # Marksheet
    # ==========================
    elif (
        "marksheet" in text
        or "statement of marks" in text
        or "percentage" in text
        or "grade" in text
    ):
        return "Marksheet", "98%"



    # ==========================
    # Driving License
    # ==========================
    elif (
        "driving licence" in text
        or "driving license" in text
        or "transport department" in text
    ):
        return "Driving License", "98%"



    # ==========================
    # Passport
    # ==========================
    elif (
        "passport" in text
        or "republic of india" in text
        or "passport number" in text
    ):
        return "Passport", "98%"



    # ==========================
    # Medical
    # ==========================
    elif (
        "medical" in text
        or "hospital" in text
        or "patient" in text
        or "doctor" in text
    ):
        return "Medical", "97%"



    # ==========================
    # Legal
    # ==========================
    elif (
        "agreement" in text
        or "contract" in text
        or "legal notice" in text
    ):
        return "Legal", "96%"



    # ==========================
    # Default
    # ==========================
    else:
        return "Other", "80%"