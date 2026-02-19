from app.models import Base
print("Tables in Base.metadata:", list(Base.metadata.tables.keys()))
