from pydantic import BaseModel, Field


class CodeExplanationRequest(BaseModel):
    title: str = Field(..., example="Two Sum")
    problem_statement: str = Field(..., example="Given an array of integers nums and target...")
    language: str = Field(..., example="Python")
    code: str = Field(..., example="def two_sum(nums, target):")