from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from ocr import extract_text
from database import classify_document

from db import Base, engine, SessionLocal
from models import Document

import os

app = FastAPI(
    title="AI Powered Document Classification System",
    version="1.0.0",
    description="Final Year AI Project"
)

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-powered-document-classification.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Create Database
# ==========================

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "AI Powered Document Classification System API Running"
    }


@app.get("/health")
def health():
    return {
        "status": "Running"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # OCR
    text = extract_text(file_path)

    # Classification
    category, confidence = classify_document(text)

    # Save Database
    db = SessionLocal()

    new_doc = Document(
        filename=file.filename,
        category=category,
        confidence=confidence
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
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