def classify_document(text):
    text = text.lower()

    if "invoice" in text:
        return "Invoice"

    elif "resume" in text or "curriculum vitae" in text:
        return "Resume"

    elif "project" in text:
        return "Project Report"

    elif "medical" in text:
        return "Medical"

    elif "agreement" in text:
        return "Legal"

    else:
        return "Other"