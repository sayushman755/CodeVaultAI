from fastapi import APIRouter, HTTPException
from models.ai_model import CodeExplanationRequest
from services.ai_service import generate_code_explanation

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Explanation"]
)


@router.post("/generate-explanation")
def generate_explanation(request: CodeExplanationRequest):
    try:
        result = generate_code_explanation(
            title=request.title,
            problem_statement=request.problem_statement,
            language=request.language,
            code=request.code
        )

        return {
            "message": "Explanation generated successfully",
            "result": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI explanation generation failed: {str(e)}"
        )