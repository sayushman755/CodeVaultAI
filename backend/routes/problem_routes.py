from fastapi import APIRouter, HTTPException, Depends
from models.problem_model import ProblemCreate, ProblemGenerateAndSave
from database import problems_collection
from services.ai_service import generate_code_explanation
from services.auth_dependency import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(
    prefix="/api/problems",
    tags=["Problems"]
)


def problem_serializer(problem) -> dict:
    return {
        "id": str(problem["_id"]),
        "user_id": problem.get("user_id", ""),
        "title": problem["title"],
        "problem_statement": problem["problem_statement"],
        "date_solved": problem["date_solved"],
        "language": problem["language"],
        "difficulty": problem["difficulty"],
        "topics": problem.get("topics", []),
        "code": problem["code"],
        "line_by_line_explanation": problem.get("line_by_line_explanation", []),
        "summary": problem.get("summary", ""),
        "time_complexity": problem.get("time_complexity", ""),
        "space_complexity": problem.get("space_complexity", ""),
        "interview_explanation": problem.get("interview_explanation", ""),
        "created_at": problem.get("created_at"),
        "updated_at": problem.get("updated_at")
    }


@router.post("/")
def create_problem(
    problem: ProblemCreate,
    current_user: dict = Depends(get_current_user)
):
    problem_data = problem.dict()

    problem_data["user_id"] = current_user["id"]
    problem_data["date_solved"] = str(problem_data["date_solved"])
    problem_data["created_at"] = datetime.now().isoformat()
    problem_data["updated_at"] = datetime.now().isoformat()

    result = problems_collection.insert_one(problem_data)
    saved_problem = problems_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Problem saved successfully",
        "problem": problem_serializer(saved_problem)
    }


@router.get("/")
def get_all_problems(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}

    problems = problems_collection.find(query).sort("created_at", -1)

    return {
        "total": problems_collection.count_documents(query),
        "problems": [problem_serializer(problem) for problem in problems]
    }


@router.post("/generate-and-save")
def generate_and_save_problem(
    problem: ProblemGenerateAndSave,
    current_user: dict = Depends(get_current_user)
):
    try:
        ai_result = generate_code_explanation(
            title=problem.title,
            problem_statement=problem.problem_statement,
            language=problem.language,
            code=problem.code
        )

        problem_data = problem.dict()

        problem_data["user_id"] = current_user["id"]
        problem_data["date_solved"] = str(problem_data["date_solved"])
        problem_data["line_by_line_explanation"] = ai_result.get(
            "line_by_line_explanation", []
        )
        problem_data["summary"] = ai_result.get("summary", "")
        problem_data["time_complexity"] = ai_result.get("time_complexity", "")
        problem_data["space_complexity"] = ai_result.get("space_complexity", "")
        problem_data["interview_explanation"] = ai_result.get(
            "interview_explanation", ""
        )
        problem_data["created_at"] = datetime.now().isoformat()
        problem_data["updated_at"] = datetime.now().isoformat()

        result = problems_collection.insert_one(problem_data)
        saved_problem = problems_collection.find_one({"_id": result.inserted_id})

        return {
            "message": "AI explanation generated and problem saved successfully",
            "problem": problem_serializer(saved_problem)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Generate and save failed: {str(e)}"
        )


@router.get("/date/{date_solved}")
def get_problems_by_date(
    date_solved: str,
    current_user: dict = Depends(get_current_user)
):
    query = {
        "user_id": current_user["id"],
        "date_solved": date_solved
    }

    problems = problems_collection.find(query).sort("created_at", -1)

    return {
        "date": date_solved,
        "total": problems_collection.count_documents(query),
        "problems": [problem_serializer(problem) for problem in problems]
    }


@router.get("/language/{language}")
def get_problems_by_language(
    language: str,
    current_user: dict = Depends(get_current_user)
):
    query = {
        "user_id": current_user["id"],
        "language": {"$regex": f"^{language}$", "$options": "i"}
    }

    problems = problems_collection.find(query).sort("created_at", -1)

    return {
        "language": language,
        "total": problems_collection.count_documents(query),
        "problems": [problem_serializer(problem) for problem in problems]
    }


@router.get("/topic/{topic}")
def get_problems_by_topic(
    topic: str,
    current_user: dict = Depends(get_current_user)
):
    query = {
        "user_id": current_user["id"],
        "topics": {"$regex": f"^{topic}$", "$options": "i"}
    }

    problems = problems_collection.find(query).sort("created_at", -1)

    return {
        "topic": topic,
        "total": problems_collection.count_documents(query),
        "problems": [problem_serializer(problem) for problem in problems]
    }


@router.get("/{problem_id}")
def get_problem_by_id(
    problem_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")

    problem = problems_collection.find_one({
        "_id": ObjectId(problem_id),
        "user_id": current_user["id"]
    })

    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    return {
        "problem": problem_serializer(problem)
    }


@router.put("/{problem_id}")
def update_problem(
    problem_id: str,
    problem: ProblemCreate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")

    existing_problem = problems_collection.find_one({
        "_id": ObjectId(problem_id),
        "user_id": current_user["id"]
    })

    if not existing_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    updated_data = problem.dict()
    updated_data["user_id"] = current_user["id"]
    updated_data["date_solved"] = str(updated_data["date_solved"])
    updated_data["updated_at"] = datetime.now().isoformat()

    problems_collection.update_one(
        {
            "_id": ObjectId(problem_id),
            "user_id": current_user["id"]
        },
        {
            "$set": updated_data
        }
    )

    updated_problem = problems_collection.find_one({
        "_id": ObjectId(problem_id),
        "user_id": current_user["id"]
    })

    return {
        "message": "Problem updated successfully",
        "problem": problem_serializer(updated_problem)
    }


@router.delete("/{problem_id}")
def delete_problem(
    problem_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem ID")

    existing_problem = problems_collection.find_one({
        "_id": ObjectId(problem_id),
        "user_id": current_user["id"]
    })

    if not existing_problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    problems_collection.delete_one({
        "_id": ObjectId(problem_id),
        "user_id": current_user["id"]
    })

    return {
        "message": "Problem deleted successfully",
        "deleted_problem_id": problem_id
    }