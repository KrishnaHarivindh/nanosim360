from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    formula = Column(String(50), nullable=False)
    category = Column(String(50), nullable=False) # e.g. Carbon-based, Metal, Metal Oxide, Semiconductor
    dimensionality = Column(String(10), nullable=False) # 0D, 1D, 2D, 3D
    density_g_cm3 = Column(Float, nullable=True)
    structure_type = Column(String(50), nullable=False) # e.g. Hexagonal sheet, Cylinder, Sphere, Wurtzite
    description = Column(Text, nullable=False)
    electrical_properties = Column(Text, nullable=False)
    optical_properties = Column(Text, nullable=False)
    mechanical_properties = Column(Text, nullable=False)
    applications = Column(JSON, nullable=False) # List of applications
    advantages = Column(JSON, nullable=False)
    limitations = Column(JSON, nullable=False)
    references = Column(JSON, nullable=False) # List of citations/DOIs
    created_at = Column(DateTime, default=datetime.utcnow)

class CalculationRecord(Base):
    __tablename__ = "calculations"

    id = Column(Integer, primary_key=True, index=True)
    material_slug = Column(String(50), nullable=True)
    shape = Column(String(50), default="sphere")
    inputs = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class MLPredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    target_property = Column(String(100), nullable=False)
    features_input = Column(JSON, nullable=False)
    predicted_value = Column(Float, nullable=False)
    predicted_unit = Column(String(50), nullable=False)
    confidence_interval = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ComparisonRecord(Base):
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, index=True)
    material_slugs = Column(JSON, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
