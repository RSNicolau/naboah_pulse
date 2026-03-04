from sqlmodel import create_engine, Session, SQLModel
from config import settings

# Supabase often requires specific connection parameters for pooling (Transaction mode)
# We use connect_args to handle potential SSL requirements of hosted Postgres
engine = create_engine(
    settings.DATABASE_URL, 
    echo=True,
    connect_args={"sslmode": "require"} if "supabase" in settings.DATABASE_URL else {}
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
