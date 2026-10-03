from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ocr import extract_text

from database import (
    classify_document,
    verify_document,
    detect_fraud,
    generate_summary
)

from db import Base, engine, SessionLocal
from models import Document

import os
import cv2
import tempfile


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="AI Powered Document Classification System",
    version="2.0.0",
    description="AI-based Document Classification, OCR, Verification, Fraud Detection and Summarization System"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Local Frontend
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Render Frontend
        "https://ai-powered-document-classification.onrender.com",

        # Vercel Frontend
        "https://ai-powered-document-classification.vercel.app"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================================
# CREATE DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "AI Powered Document Classification System API Running",

        "version": "2.0.0",

        "features": [
            "OCR",
            "Document Classification",
            "Document Verification",
            "Fraud Detection",
            "AI Auto Summary",
            "Face Verification",
            "Upload History"
        ]
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "Running",
        "backend": "FastAPI",
        "system": "AI Powered Document Classification"
    }


# =========================================================
# UPLOAD DOCUMENT
# =========================================================

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    # -------------------------------------------------------
    # Check File
    # -------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )


    # -------------------------------------------------------
    # Allowed File Types
    # -------------------------------------------------------

    allowed_extensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    ]

    extension = os.path.splitext(
        file.filename
    )[1].lower()


    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF, JPG, JPEG or PNG."
        )


    # -------------------------------------------------------
    # Create Upload Folder
    # -------------------------------------------------------

    os.makedirs(
        "uploads",
        exist_ok=True
    )


    # -------------------------------------------------------
    # Save File
    # -------------------------------------------------------

    file_path = os.path.join(
        "uploads",
        file.filename
    )


    try:

        file_content = await file.read()

        with open(
            file_path,
            "wb"
        ) as f:

            f.write(file_content)

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"File saving error: {str(e)}"
        )


    # =======================================================
    # OCR TEXT EXTRACTION
    # =======================================================

    try:

        text = extract_text(
            file_path
        )

    except Exception as e:

        print(
            "OCR Error:",
            e
        )

        text = ""


    # =======================================================
    # DOCUMENT PROCESSING
    # =======================================================

    if not text:

        category = "Unreadable Document"

        confidence = "0%"

        verification = "Incomplete"

        fraud_status = "Unknown"

        summary = (
            "No readable text could be extracted "
            "from this document."
        )

    else:

        # ---------------------------------------------------
        # Document Classification
        # ---------------------------------------------------

        category, confidence = classify_document(
            text
        )


        # ---------------------------------------------------
        # Document Verification
        # ---------------------------------------------------

        verification = verify_document(
            text
        )


        # ---------------------------------------------------
        # Fraud Detection
        # ---------------------------------------------------

        fraud_status = detect_fraud(
            text
        )


        # ---------------------------------------------------
        # AI Auto Summary
        # ---------------------------------------------------

        summary = generate_summary(
            text
        )


    # =======================================================
    # SAVE TO DATABASE
    # =======================================================

    db = SessionLocal()

    try:

        new_doc = Document(

            filename=file.filename,

            category=category,

            confidence=confidence

        )

        db.add(
            new_doc
        )

        db.commit()

        db.refresh(
            new_doc
        )

    except Exception as e:

        db.rollback()

        print(
            "Database Error:",
            e
        )

    finally:

        db.close()


    # =======================================================
    # FINAL RESPONSE
    # =======================================================

    return {

        "filename": file.filename,

        "category": category,

        "confidence": confidence,

        "verification": verification,

        "fraud_status": fraud_status,

        "summary": summary,

        "text": text[:3000]

    }


# =========================================================
# FACE VERIFICATION
# =========================================================

@app.post("/face-verify")
async def face_verify(file: UploadFile = File(...)):

    # -------------------------------------------------------
    # Check File
    # -------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No image selected"
        )


    # -------------------------------------------------------
    # Allowed Image Types
    # -------------------------------------------------------

    allowed_extensions = [
        ".jpg",
        ".jpeg",
        ".png"
    ]

    extension = os.path.splitext(
        file.filename
    )[1].lower()


    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Please upload JPG, JPEG or PNG image."
        )


    temp_path = None


    try:

        # ---------------------------------------------------
        # Read Image
        # ---------------------------------------------------

        image_data = await file.read()


        # ---------------------------------------------------
        # Create Temporary Image File
        # ---------------------------------------------------

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            temp_file.write(
                image_data
            )

            temp_path = temp_file.name


        # ---------------------------------------------------
        # Load Image
        # ---------------------------------------------------

        image = cv2.imread(
            temp_path
        )


        if image is None:

            raise HTTPException(
                status_code=400,
                detail="Invalid image file."
            )


        # ---------------------------------------------------
        # Convert To Gray
        # ---------------------------------------------------

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )


        # ---------------------------------------------------
        # Load Face Detector
        # ---------------------------------------------------

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades +
            "haarcascade_frontalface_default.xml"
        )


        # ---------------------------------------------------
        # Detect Faces
        # ---------------------------------------------------

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(50, 50)
        )


        # ---------------------------------------------------
        # Face Found
        # ---------------------------------------------------

        if len(faces) > 0:

            return {

                "status": "success",

                "verified": True,

                "message": "Face detected successfully.",

                "faces_detected": len(faces)

            }


        # ---------------------------------------------------
        # Face Not Found
        # ---------------------------------------------------

        return {

            "status": "success",

            "verified": False,

            "message": "No face detected in the image.",

            "faces_detected": 0

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "Face Verification Error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=f"Face verification error: {str(e)}"
        )


    finally:

        # ---------------------------------------------------
        # Delete Temporary File
        # ---------------------------------------------------

        if temp_path and os.path.exists(
            temp_path
        ):

            try:

                os.remove(
                    temp_path
                )

            except Exception:

                pass


# =========================================================
# UPLOAD HISTORY
# =========================================================

@app.get("/history")
def get_history():

    db = SessionLocal()

    try:

        documents = db.query(
            Document
        ).all()

        history = []

        for doc in documents:

            history.append({

                "id": doc.id,

                "filename": doc.filename,

                "category": doc.category,

                "confidence": doc.confidence

            })

        return history

    finally:

        db.close()