from fastapi import APIRouter, HTTPException, Depends
from models.statement_model import StatementCreate
from database import problem_statements_collection
from services.auth_dependency import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(
    prefix="/api/statements",
    tags=["Problem Statements"]
)


def statement_serializer(statement) -> dict:
    return {
        "id": str(statement["_id"]),
        "user_id": statement.get("user_id", ""),
        "title": statement["title"],
        "problem_statement": statement["problem_statement"],
        "source": statement.get("source", ""),
        "difficulty": statement["difficulty"],
        "topics": statement.get("topics", []),
        "status": statement.get("status", "Pending"),
        "language_planned": statement.get("language_planned", ""),
        "target_date": statement.get("target_date"),
        "created_at": statement.get("created_at"),
        "updated_at": statement.get("updated_at")
    }


@router.post("/")
def create_statement(
    statement: StatementCreate,
    current_user: dict = Depends(get_current_user)
):
    statement_data = statement.dict()

    statement_data["user_id"] = current_user["id"]

    if statement_data.get("target_date"):
        statement_data["target_date"] = str(statement_data["target_date"])

    statement_data["status"] = statement_data.get("status", "Pending")
    statement_data["created_at"] = datetime.now().isoformat()
    statement_data["updated_at"] = datetime.now().isoformat()

    result = problem_statements_collection.insert_one(statement_data)
    saved_statement = problem_statements_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Problem statement saved successfully",
        "statement": statement_serializer(saved_statement)
    }


@router.get("/")
def get_all_statements(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}
    statements = problem_statements_collection.find(query).sort("created_at", -1)

    return {
        "total": problem_statements_collection.count_documents(query),
        "statements": [statement_serializer(statement) for statement in statements]
    }


@router.get("/pending")
def get_pending_statements(current_user: dict = Depends(get_current_user)):
    query = {
        "user_id": current_user["id"],
        "status": {"$regex": "^Pending$", "$options": "i"}
    }

    statements = problem_statements_collection.find(query).sort("created_at", -1)

    return {
        "status": "Pending",
        "total": problem_statements_collection.count_documents(query),
        "statements": [statement_serializer(statement) for statement in statements]
    }


@router.get("/solved")
def get_solved_statements(current_user: dict = Depends(get_current_user)):
    query = {
        "user_id": current_user["id"],
        "status": {"$regex": "^Solved$", "$options": "i"}
    }

    statements = problem_statements_collection.find(query).sort("created_at", -1)

    return {
        "status": "Solved",
        "total": problem_statements_collection.count_documents(query),
        "statements": [statement_serializer(statement) for statement in statements]
    }


@router.get("/{statement_id}")
def get_statement_by_id(
    statement_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(statement_id):
        raise HTTPException(status_code=400, detail="Invalid statement ID")

    statement = problem_statements_collection.find_one({
        "_id": ObjectId(statement_id),
        "user_id": current_user["id"]
    })

    if not statement:
        raise HTTPException(status_code=404, detail="Problem statement not found")

    return {
        "statement": statement_serializer(statement)
    }


@router.put("/{statement_id}")
def update_statement(
    statement_id: str,
    statement: StatementCreate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(statement_id):
        raise HTTPException(status_code=400, detail="Invalid statement ID")

    existing_statement = problem_statements_collection.find_one({
        "_id": ObjectId(statement_id),
        "user_id": current_user["id"]
    })

    if not existing_statement:
        raise HTTPException(status_code=404, detail="Problem statement not found")

    updated_data = statement.dict()
    updated_data["user_id"] = current_user["id"]

    if updated_data.get("target_date"):
        updated_data["target_date"] = str(updated_data["target_date"])

    updated_data["updated_at"] = datetime.now().isoformat()

    problem_statements_collection.update_one(
        {
            "_id": ObjectId(statement_id),
            "user_id": current_user["id"]
        },
        {"$set": updated_data}
    )

    updated_statement = problem_statements_collection.find_one({
        "_id": ObjectId(statement_id),
        "user_id": current_user["id"]
    })

    return {
        "message": "Problem statement updated successfully",
        "statement": statement_serializer(updated_statement)
    }


@router.put("/{statement_id}/mark-solved")
def mark_statement_as_solved(
    statement_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(statement_id):
        raise HTTPException(status_code=400, detail="Invalid statement ID")

    existing_statement = problem_statements_collection.find_one({
        "_id": ObjectId(statement_id),
        "user_id": current_user["id"]
    })

    if not existing_statement:
        raise HTTPException(status_code=404, detail="Problem statement not found")

    problem_statements_collection.update_one(
        {
            "_id": ObjectId(statement_id),
            "user_id": current_user["id"]
        },
        {
            "$set": {
                "status": "Solved",
                "updated_at": datetime.now().isoformat()
            }
        }
    )

    updated_statement = problem_statements_collection.find_one({
        "_id": ObjectId(statement_id),
        "user_id": current_user["id"]
    })

    return {
        "message": "Problem statement marked as solved",
        "statement": statement_serializer(updated_statement)
    }


@router.delete("/{statement_id}")
def delete_statement(
    statement_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(statement_id):
        raise HTTPException(status_code=400, detail="Invalid statement ID")

    existing_statement = problem_statements_collection.find_one({
        "_id": ObjectId(statement_id),
        "user_id": current_user["id"]
    })

    if not existing_statement:
        raise HTTPException(status_code=404, detail="Problem statement not found")

    problem_statements_collection.delete_one({
        "_id": ObjectId(statement_id),
        "user_id": current_user["id"]
    })

    return {
        "message": "Problem statement deleted successfully",
        "deleted_statement_id": statement_id
    }