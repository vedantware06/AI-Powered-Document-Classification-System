import re

def classify_document(text):
    # Convert to lowercase
    text = text.lower()

    # Remove extra spaces, tabs, new lines
    text = re.sub(r"\s+", " ", text)

    # Debug
    print("=" * 50)
    print(text)
    print("=" * 50)

    # Caste Certificate
    if (
        "form of caste certificate" in text
        or "caste certificate" in text
        or "other backward classes" in text
        or "vimukta jati" in text
        or "nomadic tribes" in text
        or "special backward class" in text
        or "educationally and socially backward class" in text
        or "scheduled caste" in text
    ):
        return "Caste Certificate", "99%"

    # Resume
    elif (
        "resume" in text
        or "curriculum vitae" in text
        or ("skills" in text and "education" in text)
    ):
        return "Resume", "99%"

    # Invoice
    elif (
        "invoice" in text
        or "bill" in text
        or "gst" in text
    ):
        return "Invoice", "98%"

    # Aadhaar Card
    elif (
        "aadhaar" in text
        or "unique identification authority of india" in text
    ):
        return "Aadhaar Card", "99%"

    # PAN Card
    elif (
        "income tax department" in text
        or "permanent account number" in text
    ):
        return "PAN Card", "99%"

    # Marksheet
    elif (
        "marksheet" in text
        or "statement of marks" in text
        or "grade" in text
    ):
        return "Marksheet", "98%"

    # Driving License
    elif (
        "driving licence" in text
        or "driving license" in text
    ):
        return "Driving License", "98%"

    # Passport
    elif (
        "passport" in text
        or "republic of india" in text
    ):
        return "Passport", "98%"

    # Medical
    elif (
        "medical" in text
        or "hospital" in text
        or "patient" in text
    ):
        return "Medical", "97%"

    # Legal
    elif (
        "agreement" in text
        or "contract" in text
    ):
        return "Legal", "96%"

    # Project Report
    elif (
        "project report" in text
        or "abstract" in text
    ):
        return "Project Report", "95%"

    # Default
    else:
        return "Other", "80%"