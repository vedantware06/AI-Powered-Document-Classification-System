from fastapi import FastAPI, UploadFile, File
from backend.ocr import extract_text
from backend.database import classify_document

from backend.db import Base, engine, SessionLocal
from backend.models import Document

import os

app = FastAPI(
    title="AI Powered Document Classification System",
    version="1.0.0",
    description="Final Year AI Project"
)

# Create database
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Welcome"
    }


@app.get("/health")
def health():
    return {
        "status": "Running"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    # Create uploads folder
    os.makedirs("uploads", exist_ok=True)

    # Save uploaded file
    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # OCR
    text = extract_text(file_path)

    print("=" * 50)
    print(text)
    print("=" * 50)

    # Classification
    category, confidence = classify_document(text)

    # Save in Database
    db = SessionLocal()

    new_doc = Document(
        filename=file.filename,
        category=category,
        confidence=confidence
    )

    db.add(new_doc)
    db.commit()
    db.close()

    return {
        "filename": file.filename,
        "category": category,
        "confidence": confidence,
        "text": text[:1000]
    }


@app.get("/history")
def get_history():

    db = SessionLocal()

    documents = db.query(Document).all()

    history = []

    for doc in documents:
        history.append({
            "id": doc.id,
            "filename": doc.filename,
            "category": doc.category,
            "confidence": doc.confidence
        })

    db.close()

    return history