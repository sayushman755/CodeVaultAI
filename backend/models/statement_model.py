from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class StatementCreate(BaseModel):
    title: str = Field(..., example="Reverse Linked List")
    problem_statement: str = Field(..., example="Given the head of a singly linked list, reverse the list.")
    source: Optional[str] = Field(default="", example="LeetCode")
    difficulty: str = Field(..., example="Easy")
    topics: List[str] = Field(default=[], example=["Linked List"])
    status: str = Field(default="Pending", example="Pending")
    language_planned: Optional[str] = Field(default="", example="Python")
    target_date: Optional[date] = Field(default=None, example="2026-05-25")