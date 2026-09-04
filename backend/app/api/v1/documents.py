"""
Document upload and RAG API.
"""
import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.base import get_db
from app.models.user import User
from app.models.documents import Document
from app.core.dependencies import get_current_active_user
from app.core.config import settings
from app.rag.processor import document_processor

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: Optional[str] = Form("notes"),
    subject: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Upload and process a document for RAG."""
    # Validate file type
    content_type = file.content_type or ""
    # Fallback to extension detection
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    ext_map = {"pdf": "pdf", "docx": "docx", "txt": "txt", "pptx": "pptx"}

    file_ext = ALLOWED_TYPES.get(content_type) or ext_map.get(ext)
    if not file_ext:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: PDF, DOCX, TXT, PPTX"
        )

    # Check file size
    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Create DB record
    doc = Document(
        user_id=current_user.id,
        filename=safe_filename,
        original_filename=file.filename,
        file_type=file_ext,
        file_size=len(content),
        file_path=file_path,
        document_type=document_type,
        subject=subject,
        description=description,
        is_processed=False,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Process asynchronously (extract text, chunk, embed)
    try:
        await document_processor.process(doc.id, file_path, file_ext, str(current_user.id), db)
    except Exception as e:
        # Don't fail upload if processing fails — mark as unprocessed
        doc.is_processed = False
        db.commit()

    return {
        "id": str(doc.id),
        "filename": doc.original_filename,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "is_processed": doc.is_processed,
        "document_type": doc.document_type,
        "subject": doc.subject,
    }


@router.get("/")
async def list_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(d.id),
            "filename": d.original_filename,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "is_processed": d.is_processed,
            "document_type": d.document_type,
            "subject": d.subject,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    # Delete from ChromaDB
    try:
        await document_processor.delete_document(str(doc.id), str(current_user.id))
    except Exception:
        pass

    db.delete(doc)
    db.commit()
