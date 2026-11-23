import pytest
from backend.calculator import (
    calculate_sphere_properties,
    calculate_cnt_chiral_geometry,
    convert_length
)
from backend.ml_engine import predict_nanomaterial_property, get_model_metadata

def test_specific_surface_area_and_ratio():
    # Gold nanoparticle test (20 nm, 19.32 g/cm3 = 19320 kg/m3)
    res = calculate_sphere_properties(diameter=20.0, diameter_unit="nm", density=19.32, density_unit="g/cm3")
    
    # SA/V ratio = 6 / 20 = 0.3 nm^-1 = 3e7 m^-1
    assert pytest.approx(res["surface_area_to_volume_ratio"]["value_nm_inv"], 1e-4) == 0.3
    assert res["surface_area_to_volume_ratio"]["value_m_inv"] == pytest.approx(3.0e8, rel=1e-12)
    
    # Specific Surface Area: SSA = 6 / (rho * d)
    # rho = 19320 kg/m3, d = 20e-9 m -> rho * d = 3.864e-4 kg/m2
    # SSA = 6 / 3.864e-4 = 15527.95 m2/kg = 15.53 m2/g
    assert pytest.approx(res["specific_surface_area"]["value_m2_g"], 0.1) == 15.53
    assert "derivation_step" in res["surface_area_to_volume_ratio"]
    assert "derivation_step" in res["specific_surface_area"]

def test_carbon_nanotube_chiral_geometry():
    # Armchair (10, 10) SWCNT
    # Chiral angle must be 30.0 degrees
    # Metallicity must be True since (10 - 10) % 3 == 0
    cnt_10_10 = calculate_cnt_chiral_geometry(n=10, m=10, length_nm=10.0)
    assert cnt_10_10["classification"] == "Armchair"
    assert pytest.approx(cnt_10_10["chiral_angle_deg"], 0.01) == 30.0
    assert cnt_10_10["is_metallic"] is True
    assert cnt_10_10["estimated_bandgap_ev"] == 0.0
    # Diameter dt = (0.2461 / pi) * sqrt(100 + 100 + 100) = 0.078335 * sqrt(300) = 0.078335 * 17.3205 ≈ 1.3568 nm
    assert pytest.approx(cnt_10_10["diameter_nm"], 0.05) == 1.36

    # Zigzag (10, 0) SWCNT
    # Chiral angle must be 0 degrees
    # Metallicity must be False since (10 - 0) % 3 = 1 != 0 (Semiconducting)
    cnt_10_0 = calculate_cnt_chiral_geometry(n=10, m=0, length_nm=10.0)
    assert cnt_10_0["classification"] == "Zigzag"
    assert cnt_10_0["chiral_angle_deg"] == 0.0
    assert cnt_10_0["is_metallic"] is False
    assert cnt_10_0["estimated_bandgap_ev"] > 0.5

def test_ml_bandgap_prediction():
    # CdSe Quantum Dot (bulk bandgap ~1.74 eV, epsilon ~9.3)
    meta = get_model_metadata()
    assert "evaluation_metrics" in meta
    assert meta["evaluation_metrics"]["R2_score"] > 0.85
    
    # Confinement test: a 3 nm particle should have a higher bandgap than bulk (1.74 eV)
    pred_small = predict_nanomaterial_property(
        diameter_nm=3.0,
        bulk_bandgap_ev=1.74,
        dielectric_constant=9.3,
        m_e_ratio=0.13,
        m_h_ratio=0.45
    )
    assert pred_small["predicted_effective_bandgap_ev"] > 1.74
    assert pred_small["confinement_energy_shift_ev"] > 0.0
    assert pred_small["estimated_emission_wavelength_nm"] > 0.0
