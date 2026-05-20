from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class LineExplanation(BaseModel):
    line: int
    code: str
    explanation: str


class ProblemCreate(BaseModel):
    title: str = Field(..., example="Two Sum")
    problem_statement: str = Field(..., example="Given an array of integers nums and a target...")
    date_solved: date = Field(..., example="2026-05-20")
    language: str = Field(..., example="Python")
    difficulty: str = Field(..., example="Easy")
    topics: List[str] = Field(default=[], example=["Array", "HashMap"])
    code: str = Field(..., example="def two_sum(nums, target):")
    line_by_line_explanation: Optional[List[LineExplanation]] = []
    summary: Optional[str] = Field(default="", example="This code solves Two Sum using a hash map.")
    time_complexity: Optional[str] = Field(default="", example="O(n)")
    space_complexity: Optional[str] = Field(default="", example="O(n)")
    interview_explanation: Optional[str] = Field(default="", example="In an interview, I would explain this using a hash map.")


class ProblemGenerateAndSave(BaseModel):
    title: str = Field(..., example="Two Sum")
    problem_statement: str = Field(..., example="Given an array of integers nums and a target...")
    date_solved: date = Field(..., example="2026-05-20")
    language: str = Field(..., example="Python")
    difficulty: str = Field(..., example="Easy")
    topics: List[str] = Field(default=[], example=["Array", "HashMap"])
    code: str = Field(..., example="def two_sum(nums, target):")