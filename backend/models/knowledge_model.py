from pydantic import BaseModel, Field
from typing import List, Optional


class KnowledgeNoteCreate(BaseModel):
    title: str = Field(..., example="Convert comma-separated input into array")
    category: str = Field(..., example="JavaScript Logic")
    note_type: str = Field(..., example="Code Snippet")
    description: str = Field(..., example="Useful logic for converting topic input into an array.")
    code_snippet: Optional[str] = Field(default="", example="topics.split(',').map(topic => topic.trim())")
    explanation: Optional[str] = Field(default="", example="This splits input by comma and removes spaces.")
    tags: List[str] = Field(default=[], example=["React", "JavaScript", "Form Handling"])
    skill_level: Optional[str] = Field(default="Beginner", example="Beginner")