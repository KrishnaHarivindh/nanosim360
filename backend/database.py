import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, Material
from backend.seed_data import NANOMATERIALS_SEED_DATA

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nanosim360.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if materials exist
        existing_count = db.query(Material).count()
        if existing_count == 0:
            for item in NANOMATERIALS_SEED_DATA:
                mat = Material(
                    slug=item["slug"],
                    name=item["name"],
                    formula=item["formula"],
                    category=item["category"],
                    dimensionality=item["dimensionality"],
                    density_g_cm3=item["density_g_cm3"],
                    structure_type=item["structure_type"],
                    description=item["description"],
                    electrical_properties=item["electrical_properties"],
                    optical_properties=item["optical_properties"],
                    mechanical_properties=item["mechanical_properties"],
                    applications=item["applications"],
                    advantages=item["advantages"],
                    limitations=item["limitations"],
                    references=item["references"],
                )
                db.add(mat)
            db.commit()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
