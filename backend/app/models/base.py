import json
from typing import Any, List, Optional
from sqlalchemy import TypeDecorator, JSON, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base


class VectorType(TypeDecorator):
    """
    TypeDecorator that provides pgvector `Vector` on PostgreSQL,
    and falls back to JSON / Array representation on SQLite / other engines.
    """
    impl = JSON
    cache_ok = True

    def __init__(self, dim: int = 1536, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dim = dim

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            try:
                from pgvector.sqlalchemy import Vector
                return dialect.type_descriptor(Vector(self.dim))
            except ImportError:
                return dialect.type_descriptor(JSONB)
        return dialect.type_descriptor(JSON)

    def process_bind_param(self, value: Optional[List[float]], dialect) -> Any:
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value
        return json.dumps(value) if isinstance(value, list) else value

    def process_result_value(self, value: Any, dialect) -> Optional[List[float]]:
        if value is None:
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return None
        return list(value) if hasattr(value, "__iter__") else value
