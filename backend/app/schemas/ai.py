"""
Pydantic schemas for AI/NL2SQL endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any


class NLQueryRequest(BaseModel):
    """Request body for the /ai/nlq endpoint."""
    question: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Natural language question about the ERP data",
        examples=["Which buyer generated the highest revenue?"],
    )


class NLQueryResponse(BaseModel):
    """Response from the /ai/nlq endpoint."""
    question: str
    sql: str
    rows: List[dict[str, Any]]
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)
    error: Optional[bool] = None


class ExplainRequest(BaseModel):
    """Request body for the /ai/explain-result endpoint."""
    question: str = Field(..., min_length=3, max_length=500)
    sql: str = Field(..., min_length=5)
    rows: List[dict[str, Any]] = Field(default_factory=list)


class ExplainResponse(BaseModel):
    """Response from the /ai/explain-result endpoint."""
    explanation: str
    confidence: float = Field(ge=0.0, le=1.0)
