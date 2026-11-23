from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import os

from backend.database import get_db, init_db
from backend.models import Material, CalculationRecord, MLPredictionRecord, ComparisonRecord
from backend.calculator import (
    calculate_sphere_properties, 
    calculate_particle_population,
    calculate_cnt_chiral_geometry
)
from backend.ml_engine import predict_nanomaterial_property, get_model_metadata
from backend.nanoverify import run_scientific_audit
from backend.nanooptics import simulate_lspr_mie
from backend.full_mie import simulate_full_mie_vs_dipole
from backend.nanocharacterize import calculate_xrd_scherrer, analyze_micrograph_particles
from backend.nanodesign import recommend_nanomaterial
from backend.nanosize import simulate_particle_size_distribution
from backend.nanostructure_studio import generate_graphene_coordinates, generate_c60_fullerene
from fastapi import UploadFile, File

# Initialize Database and Seed Data
init_db()

app = FastAPI(
    title="NanoSim 360 API",
    description="Computational Nanotechnology Framework for Material Exploration, 3D Visualization, Property Modeling & Machine Learning",
    version="1.1.0"
)

# Enable CORS for Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class SphereCalcRequest(BaseModel):
    material_slug: Optional[str] = Field(None, description="Optional material identifier slug")
    diameter: float = Field(..., gt=0, description="Particle diameter (strictly positive)")
    diameter_unit: str = Field("nm", description="Length unit (nm, um, m, angstrom, Å)")
    density: float = Field(..., gt=0, description="Material density (strictly positive)")
    density_unit: str = Field("g/cm3", description="Density unit (g/cm3, kg/m3)")

class ParticleCountRequest(BaseModel):
    total_mass: float = Field(..., gt=0, description="Total sample mass")
    total_mass_unit: str = Field("mg", description="Mass unit (g, mg, ug, kg)")
    single_particle_mass_kg: float = Field(..., gt=0, description="Mass of a single particle in kg")
    single_particle_area_m2: Optional[float] = Field(0.0, ge=0, description="Single particle surface area in m²")

class CNTChiralRequest(BaseModel):
    n: int = Field(..., ge=0, description="Chiral index n")
    m: int = Field(..., ge=0, description="Chiral index m")
    length_nm: float = Field(5.0, gt=0, description="Nanotube visualization length in nm")

class ComparisonRequest(BaseModel):
    material_slugs: List[str] = Field(..., min_items=2, description="List of at least two material slugs to compare")
    notes: Optional[str] = None

class MLPredictRequest(BaseModel):
    particle_diameter_nm: float = Field(..., gt=0, description="Particle diameter in nanometers (1 to 50 nm)")
    bulk_bandgap_ev: float = Field(..., gt=0, description="Bulk semiconductor bandgap in eV (e.g. 1.74 for CdSe, 3.2 for TiO2, 3.37 for ZnO)")
    dielectric_constant: float = Field(..., gt=0, description="Relative static dielectric constant (e.g. 9.3 for CdSe, 10.0 for ZnO)")
    electron_effective_mass_ratio: float = Field(..., gt=0, description="Electron effective mass ratio m_e*/m_0 (e.g. 0.13 for CdSe, 0.24 for ZnO)")
    hole_effective_mass_ratio: float = Field(..., gt=0, description="Hole effective mass ratio m_h*/m_0 (e.g. 0.45 for CdSe, 0.59 for ZnO)")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NanoSim 360 Computational Engine",
        "database": "connected",
        "version": "1.1.0"
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    materials_count = db.query(Material).count()
    categories = [cat[0] for cat in db.query(Material.category).distinct()]
    recent_calculations = db.query(CalculationRecord).order_by(CalculationRecord.created_at.desc()).limit(5).all()
    recent_predictions = db.query(MLPredictionRecord).order_by(MLPredictionRecord.created_at.desc()).limit(5).all()
    
    return {
        "total_materials": materials_count,
        "categories": categories,
        "total_calculations_logged": db.query(CalculationRecord).count(),
        "total_predictions_logged": db.query(MLPredictionRecord).count(),
        "recent_calculations": recent_calculations,
        "recent_predictions": recent_predictions,
        "featured_material": "graphene",
        "ml_model_status": "active"
    }

@app.get("/api/materials")
def list_materials(
    category: Optional[str] = None, 
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Material)
    if category:
        query = query.filter(Material.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(
            (Material.name.ilike(f"%{search}%")) | 
            (Material.formula.ilike(f"%{search}%")) |
            (Material.description.ilike(f"%{search}%"))
        )
    return query.all()

@app.get("/api/materials/{slug}")
def get_material(slug: str, db: Session = Depends(get_db)):
    mat = db.query(Material).filter(Material.slug == slug).first()
    if not mat:
        raise HTTPException(status_code=404, detail=f"Material with slug '{slug}' not found.")
    return mat

@app.post("/api/calculations/sphere")
def calculate_sphere(req: SphereCalcRequest, db: Session = Depends(get_db)):
    try:
        results = calculate_sphere_properties(
            diameter=req.diameter,
            diameter_unit=req.diameter_unit,
            density=req.density,
            density_unit=req.density_unit
        )
        record = CalculationRecord(
            material_slug=req.material_slug,
            shape="sphere",
            inputs=req.dict(),
            results=results
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return {
            "id": record.id,
            "created_at": record.created_at,
            "data": results
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculations/cnt-chiral")
def calculate_cnt_geometry_endpoint(req: CNTChiralRequest):
    try:
        return calculate_cnt_chiral_geometry(n=req.n, m=req.m, length_nm=req.length_nm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/calculations/particle-count")
def calculate_count(req: ParticleCountRequest):
    try:
        results = calculate_particle_population(
            total_mass=req.total_mass,
            total_mass_unit=req.total_mass_unit,
            single_particle_mass_kg=req.single_particle_mass_kg,
            single_particle_area_m2=req.single_particle_area_m2 or 0.0
        )
        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/comparisons")
def create_comparison(req: ComparisonRequest, db: Session = Depends(get_db)):
    materials = db.query(Material).filter(Material.slug.in_(req.material_slugs)).all()
    if len(materials) < len(req.material_slugs):
        found_slugs = {m.slug for m in materials}
        missing = set(req.material_slugs) - found_slugs
        raise HTTPException(status_code=404, detail=f"Materials not found: {missing}")
    
    comp_record = ComparisonRecord(
        material_slugs=req.material_slugs,
        notes=req.notes
    )
    db.add(comp_record)
    db.commit()
    db.refresh(comp_record)

    return {
        "id": comp_record.id,
        "materials": materials,
        "created_at": comp_record.created_at
    }

@app.get("/api/models")
def get_ml_models():
    return get_model_metadata()

@app.get("/api/nanoverify/audit")
def get_scientific_audit():
    return run_scientific_audit()

class MieSimRequest(BaseModel):
    material: str = Field("gold", description="gold or silver")
    diameter_nm: float = Field(20.0, gt=0, description="Particle diameter in nm")
    medium_refractive_index: float = Field(1.333, gt=0, description="Medium refractive index (e.g. 1.333 for water)")

class XRDScherrerRequest(BaseModel):
    two_theta_deg: float = Field(..., gt=0, lt=180, description="Diffraction peak position 2-theta in degrees")
    fwhm_deg: float = Field(..., gt=0, description="Full Width at Half Maximum in degrees")
    xray_wavelength_nm: float = Field(0.15406, gt=0, description="X-ray wavelength in nm (default Cu K-alpha: 0.15406 nm)")
    shape_factor_k: float = Field(0.94, gt=0, description="Scherrer shape factor K (typically 0.9 - 0.94)")

class DesignRecRequest(BaseModel):
    target_application: str = Field("photocatalysis", description="photocatalysis, biomedical_diagnostics, or energy_storage")

@app.post("/api/nanooptics/mie-lspr")
def simulate_mie_lspr(req: MieSimRequest):
    try:
        # Default to full multipole Mie theory with dipole comparison
        return simulate_full_mie_vs_dipole(
            material=req.material,
            diameter_nm=req.diameter_nm,
            medium_refractive_index=req.medium_refractive_index
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

class ParticleSizeDistRequest(BaseModel):
    distribution_type: str = Field("lognormal", description="lognormal or gaussian")
    mean_diameter_nm: float = Field(20.0, gt=0)
    std_dev_nm: float = Field(3.0, ge=0)
    sample_size: int = Field(5000, ge=100, le=20000)
    material_density_g_cm3: float = Field(19.32, gt=0)

class StructureBuildRequest(BaseModel):
    structure_type: str = Field("graphene", description="graphene or c60")
    nx: int = Field(4, ge=1, le=20)
    ny: int = Field(4, ge=1, le=20)
    dopant_element: Optional[str] = Field(None, description="e.g. N or B")
    dopant_ratio: float = Field(0.0, ge=0.0, le=0.5)
    vacancy_count: int = Field(0, ge=0)

@app.post("/api/nanosize/distribution")
def run_size_distribution(req: ParticleSizeDistRequest):
    try:
        return simulate_particle_size_distribution(
            distribution_type=req.distribution_type,
            mean_diameter_nm=req.mean_diameter_nm,
            std_dev_nm=req.std_dev_nm,
            sample_size=req.sample_size,
            material_density_g_cm3=req.material_density_g_cm3
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/nanostructure/build")
def build_structure(req: StructureBuildRequest):
    if req.structure_type.lower() == "c60":
        return generate_c60_fullerene()
    else:
        return generate_graphene_coordinates(
            nx=req.nx,
            ny=req.ny,
            dopant_element=req.dopant_element,
            dopant_ratio=req.dopant_ratio,
            vacancy_count=req.vacancy_count
        )

@app.post("/api/nanocharacterize/xrd-scherrer")
def compute_xrd_scherrer(req: XRDScherrerRequest):
    try:
        return calculate_xrd_scherrer(
            two_theta_deg=req.two_theta_deg,
            fwhm_deg=req.fwhm_deg,
            xray_wavelength_nm=req.xray_wavelength_nm,
            shape_factor_k=req.shape_factor_k
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/nanocharacterize/tem-micrograph")
async def analyze_tem_micrograph(
    file: UploadFile = File(...),
    nm_per_pixel: float = 0.5
):
    try:
        contents = await file.read()
        return analyze_micrograph_particles(
            image_bytes=contents,
            nm_per_pixel=nm_per_pixel
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

@app.post("/api/nanodesign/recommend")
def get_design_recommendations(req: DesignRecRequest):
    return recommend_nanomaterial(target_application=req.target_application)

@app.post("/api/predictions")
def run_prediction(req: MLPredictRequest, db: Session = Depends(get_db)):
    try:
        res = predict_nanomaterial_property(
            diameter_nm=req.particle_diameter_nm,
            bulk_bandgap_ev=req.bulk_bandgap_ev,
            dielectric_constant=req.dielectric_constant,
            m_e_ratio=req.electron_effective_mass_ratio,
            m_h_ratio=req.hole_effective_mass_ratio
        )
        
        # Save record
        pred_record = MLPredictionRecord(
            model_name=res["model_name"],
            target_property=res["target_property"],
            features_input=req.dict(),
            predicted_value=res["predicted_effective_bandgap_ev"],
            predicted_unit="eV",
            confidence_interval={"uncertainty_ev": res["uncertainty_ev"]}
        )
        db.add(pred_record)
        db.commit()
        db.refresh(pred_record)

        return {
            "prediction_id": pred_record.id,
            "created_at": pred_record.created_at,
            "results": res
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/predictions/history")
def get_predictions_history(db: Session = Depends(get_db)):
    return db.query(MLPredictionRecord).order_by(MLPredictionRecord.created_at.desc()).limit(20).all()
