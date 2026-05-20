from fastapi import APIRouter, Depends
from database import (
    problems_collection,
    problem_statements_collection,
    knowledge_notes_collection
)
from services.auth_dependency import get_current_user
from datetime import date, datetime, timedelta

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


def count_by_field(collection, field_name, user_id):
    pipeline = [
        {
            "$match": {
                "user_id": user_id
            }
        },
        {
            "$group": {
                "_id": f"${field_name}",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "count": -1
            }
        }
    ]

    result = collection.aggregate(pipeline)
    data = {}

    for item in result:
        key = item["_id"]

        if key:
            data[str(key)] = item["count"]

    return data


def count_by_topics(user_id):
    pipeline = [
        {
            "$match": {
                "user_id": user_id
            }
        },
        {
            "$unwind": "$topics"
        },
        {
            "$group": {
                "_id": "$topics",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "count": -1
            }
        }
    ]

    result = problems_collection.aggregate(pipeline)
    data = {}

    for item in result:
        key = item["_id"]

        if key:
            data[str(key)] = item["count"]

    return data


def calculate_streaks(user_id):
    solved_dates_cursor = problems_collection.find(
        {"user_id": user_id},
        {"date_solved": 1, "_id": 0}
    )

    solved_dates = set()

    for item in solved_dates_cursor:
        date_value = item.get("date_solved")

        if date_value:
            solved_dates.add(str(date_value))

    if not solved_dates:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_active_days": 0
        }

    date_objects = sorted([
        datetime.strptime(date_string, "%Y-%m-%d").date()
        for date_string in solved_dates
    ])

    total_active_days = len(date_objects)

    longest_streak = 1
    current_chain = 1

    for i in range(1, len(date_objects)):
        previous_date = date_objects[i - 1]
        current_date = date_objects[i]

        if current_date == previous_date + timedelta(days=1):
            current_chain += 1
            longest_streak = max(longest_streak, current_chain)
        else:
            current_chain = 1

    today = date.today()
    yesterday = today - timedelta(days=1)

    current_streak = 0

    if today in date_objects:
        check_date = today

        while check_date in date_objects:
            current_streak += 1
            check_date -= timedelta(days=1)

    elif yesterday in date_objects:
        check_date = yesterday

        while check_date in date_objects:
            current_streak += 1
            check_date -= timedelta(days=1)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_active_days": total_active_days
    }


@router.get("/stats")
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    today = str(date.today())

    total_solved_problems = problems_collection.count_documents({
        "user_id": user_id
    })

    problems_solved_today = problems_collection.count_documents({
        "user_id": user_id,
        "date_solved": today
    })

    language_wise_count = count_by_field(problems_collection, "language", user_id)

    difficulty_wise_count = count_by_field(problems_collection, "difficulty", user_id)

    topic_wise_count = count_by_topics(user_id)

    pending_statements = problem_statements_collection.count_documents({
        "user_id": user_id,
        "status": {"$regex": "^Pending$", "$options": "i"}
    })

    solved_statements = problem_statements_collection.count_documents({
        "user_id": user_id,
        "status": {"$regex": "^Solved$", "$options": "i"}
    })

    total_statements = problem_statements_collection.count_documents({
        "user_id": user_id
    })

    total_knowledge_notes = knowledge_notes_collection.count_documents({
        "user_id": user_id
    })

    streak_data = calculate_streaks(user_id)

    return {
        "total_solved_problems": total_solved_problems,
        "problems_solved_today": problems_solved_today,
        "current_streak": streak_data["current_streak"],
        "longest_streak": streak_data["longest_streak"],
        "total_active_days": streak_data["total_active_days"],
        "language_wise_count": language_wise_count,
        "difficulty_wise_count": difficulty_wise_count,
        "topic_wise_count": topic_wise_count,
        "problem_statements": {
            "total": total_statements,
            "pending": pending_statements,
            "solved": solved_statements
        },
        "knowledge_notes": {
            "total": total_knowledge_notes
        }
    }