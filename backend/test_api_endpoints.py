import pytest
import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_api_health():
    res = httpx.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_api_materials_list():
    res = httpx.get(f"{BASE_URL}/api/materials")
    assert res.status_code == 200
    materials = res.json()
    assert len(materials) >= 8
    slugs = {m["slug"] for m in materials}
    assert "graphene" in slugs
    assert "cnt" in slugs
    assert "gold-nanoparticles" in slugs

def test_api_sphere_calc():
    payload = {
        "material_slug": "gold-nanoparticles",
        "diameter": 20.0,
        "diameter_unit": "nm",
        "density": 19.32,
        "density_unit": "g/cm3"
    }
    res = httpx.post(f"{BASE_URL}/api/calculations/sphere", json=payload)
    assert res.status_code == 200
    body = res.json()
    calc = body["data"]
    assert pytest.approx(calc["surface_area_to_volume_ratio"]["value_nm_inv"], 1e-4) == 0.3
    assert pytest.approx(calc["specific_surface_area"]["value_m2_g"], 0.1) == 15.53

def test_api_cnt_chiral():
    payload = {"n": 10, "m": 10, "length_nm": 6.0}
    res = httpx.post(f"{BASE_URL}/api/calculations/cnt-chiral", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["classification"] == "Armchair"
    assert data["is_metallic"] is True
    assert pytest.approx(data["chiral_angle_deg"], 0.01) == 30.0

def test_api_ml_prediction():
    payload = {
        "particle_diameter_nm": 3.0,
        "bulk_bandgap_ev": 1.74,
        "dielectric_constant": 9.3,
        "electron_effective_mass_ratio": 0.13,
        "hole_effective_mass_ratio": 0.45
    }
    res = httpx.post(f"{BASE_URL}/api/predictions", json=payload)
    assert res.status_code == 200
    body = res.json()["results"]
    assert body["predicted_effective_bandgap_ev"] > 1.74
    assert body["model_metrics"]["R2_score"] > 0.85
