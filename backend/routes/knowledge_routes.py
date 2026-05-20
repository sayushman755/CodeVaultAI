from fastapi import APIRouter, HTTPException, Depends
from models.knowledge_model import KnowledgeNoteCreate
from database import knowledge_notes_collection
from services.auth_dependency import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(
    prefix="/api/knowledge",
    tags=["Knowledge Vault"]
)


def knowledge_serializer(note) -> dict:
    return {
        "id": str(note["_id"]),
        "user_id": note.get("user_id", ""),
        "title": note["title"],
        "category": note["category"],
        "note_type": note["note_type"],
        "description": note["description"],
        "code_snippet": note.get("code_snippet", ""),
        "explanation": note.get("explanation", ""),
        "tags": note.get("tags", []),
        "skill_level": note.get("skill_level", "Beginner"),
        "created_at": note.get("created_at"),
        "updated_at": note.get("updated_at")
    }


@router.post("/")
def create_knowledge_note(
    note: KnowledgeNoteCreate,
    current_user: dict = Depends(get_current_user)
):
    note_data = note.dict()

    note_data["user_id"] = current_user["id"]
    note_data["created_at"] = datetime.now().isoformat()
    note_data["updated_at"] = datetime.now().isoformat()

    result = knowledge_notes_collection.insert_one(note_data)
    saved_note = knowledge_notes_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Knowledge note saved successfully",
        "note": knowledge_serializer(saved_note)
    }


@router.get("/")
def get_all_knowledge_notes(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}

    notes = knowledge_notes_collection.find(query).sort("created_at", -1)

    return {
        "total": knowledge_notes_collection.count_documents(query),
        "notes": [knowledge_serializer(note) for note in notes]
    }


@router.get("/category/{category}")
def get_notes_by_category(
    category: str,
    current_user: dict = Depends(get_current_user)
):
    query = {
        "user_id": current_user["id"],
        "category": {"$regex": f"^{category}$", "$options": "i"}
    }

    notes = knowledge_notes_collection.find(query).sort("created_at", -1)

    return {
        "category": category,
        "total": knowledge_notes_collection.count_documents(query),
        "notes": [knowledge_serializer(note) for note in notes]
    }


@router.get("/tag/{tag}")
def get_notes_by_tag(
    tag: str,
    current_user: dict = Depends(get_current_user)
):
    query = {
        "user_id": current_user["id"],
        "tags": {"$regex": f"^{tag}$", "$options": "i"}
    }

    notes = knowledge_notes_collection.find(query).sort("created_at", -1)

    return {
        "tag": tag,
        "total": knowledge_notes_collection.count_documents(query),
        "notes": [knowledge_serializer(note) for note in notes]
    }


@router.get("/{note_id}")
def get_knowledge_note_by_id(
    note_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="Invalid note ID")

    note = knowledge_notes_collection.find_one({
        "_id": ObjectId(note_id),
        "user_id": current_user["id"]
    })

    if not note:
        raise HTTPException(status_code=404, detail="Knowledge note not found")

    return {
        "note": knowledge_serializer(note)
    }


@router.put("/{note_id}")
def update_knowledge_note(
    note_id: str,
    note: KnowledgeNoteCreate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="Invalid note ID")

    existing_note = knowledge_notes_collection.find_one({
        "_id": ObjectId(note_id),
        "user_id": current_user["id"]
    })

    if not existing_note:
        raise HTTPException(status_code=404, detail="Knowledge note not found")

    updated_data = note.dict()
    updated_data["user_id"] = current_user["id"]
    updated_data["updated_at"] = datetime.now().isoformat()

    knowledge_notes_collection.update_one(
        {
            "_id": ObjectId(note_id),
            "user_id": current_user["id"]
        },
        {"$set": updated_data}
    )

    updated_note = knowledge_notes_collection.find_one({
        "_id": ObjectId(note_id),
        "user_id": current_user["id"]
    })

    return {
        "message": "Knowledge note updated successfully",
        "note": knowledge_serializer(updated_note)
    }


@router.delete("/{note_id}")
def delete_knowledge_note(
    note_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="Invalid note ID")

    existing_note = knowledge_notes_collection.find_one({
        "_id": ObjectId(note_id),
        "user_id": current_user["id"]
    })

    if not existing_note:
        raise HTTPException(status_code=404, detail="Knowledge note not found")

    knowledge_notes_collection.delete_one({
        "_id": ObjectId(note_id),
        "user_id": current_user["id"]
    })

    return {
        "message": "Knowledge note deleted successfully",
        "deleted_note_id": note_id
    }