"""
AI routes — natural language query and explanation endpoints.
These are the core AI-powered features of the application.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.ai import (
    NLQueryRequest,
    NLQueryResponse,
    ExplainRequest,
    ExplainResponse,
)
from app.services import nl2sql_service

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post(
    "/nlq",
    response_model=NLQueryResponse,
    summary="Natural language to SQL query",
)
async def natural_language_query(
    request: NLQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Convert a natural language question into a safe SQL query, execute it,
    and return the results with an AI-generated business answer.

    **Pipeline:**
    1. LLM converts question → SQL
    2. SQL validator checks safety (SELECT only, allowed tables, auto-LIMIT)
    3. Execute validated query against PostgreSQL
    4. LLM generates a business-friendly answer from the results

    **Security:**
    - Only SELECT queries are executed
    - DDL/DML operations (INSERT, DELETE, DROP, etc.) are blocked
    - Only known ERP tables can be queried
    - Results are limited to prevent memory exhaustion
    """
    try:
        result = await nl2sql_service.process_question(request.question, db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred processing your question: {str(e)}",
        )


@router.post(
    "/explain-result",
    response_model=ExplainResponse,
    summary="Generate AI explanation for query results",
)
async def explain_result(request: ExplainRequest):
    """
    Generate an AI-powered business explanation for a set of query results.
    Useful for getting a fresh interpretation of previously fetched data.
    """
    try:
        result = await nl2sql_service.explain_result(
            question=request.question,
            sql=request.sql,
            rows=request.rows,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate explanation: {str(e)}",
        )
