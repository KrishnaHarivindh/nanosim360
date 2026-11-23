import pytest
import math
from backend.calculator import (
    convert_length,
    convert_mass,
    calculate_sphere_properties,
    calculate_particle_population
)

def test_unit_conversions():
    # Length conversions
    assert pytest.approx(convert_length(1, "m", "nm"), 1e-5) == 1e9
    assert pytest.approx(convert_length(1000, "nm", "um"), 1e-5) == 1.0
    assert pytest.approx(convert_length(1, "angstrom", "nm"), 1e-5) == 0.1
    assert pytest.approx(convert_length(10, "Å", "m"), 1e-12) == 1e-9

    # Mass conversions
    assert pytest.approx(convert_mass(1, "g", "mg"), 1e-5) == 1000.0
    assert pytest.approx(convert_mass(1, "mg", "ug"), 1e-5) == 1000.0
    assert pytest.approx(convert_mass(1, "kg", "g"), 1e-5) == 1000.0

def test_gold_nanoparticle_case():
    """
    Test case specified in scientific reference:
    Material: Gold (Au)
    Diameter: 20 nm
    Density: 19.32 g/cm3 (19320 kg/m3)
    
    Theoretical checks:
    Radius = 10 nm = 1e-8 m
    Surface Area = 4 * pi * (1e-8)^2 = 1.256637e-15 m^2 = 1256.637 nm^2
    Volume = (4/3) * pi * (1e-8)^3 = 4.18879e-24 m^3 = 4188.79 nm^3
    SA/V ratio = 6 / d = 6 / 20 nm = 0.3 nm^-1
    Mass = rho * V = 19320 kg/m3 * 4.18879e-24 m3 = 8.0927e-20 kg = 8.0927e-17 g
    """
    res = calculate_sphere_properties(diameter=20.0, diameter_unit="nm", density=19.32, density_unit="g/cm3")
    
    assert res["radius"]["value_nm"] == 10.0
    assert pytest.approx(res["surface_area_to_volume_ratio"]["value_nm_inv"], 1e-4) == 0.3
    assert pytest.approx(res["surface_area"]["value_nm2"], 1e-2) == 4.0 * math.pi * 100.0
    assert pytest.approx(res["volume"]["value_nm3"], 1e-2) == (4.0 / 3.0) * math.pi * 1000.0
    assert pytest.approx(res["particle_mass"]["value_g"], 1e-19) == 8.0927e-17

def test_particle_population_count():
    # 1 mg of gold nanoparticles of 20nm (approx 8.0927e-20 kg each)
    single_mass_kg = 8.0927426e-20
    pop = calculate_particle_population(total_mass=1.0, total_mass_unit="mg", single_particle_mass_kg=single_mass_kg)
    # 1e-6 kg / 8.0927e-20 kg approx 1.2356e13 particles
    assert pytest.approx(pop["particle_count"], rel=1e-3) == 1.2356e13

def test_invalid_calculator_inputs():
    with pytest.raises(ValueError):
        calculate_sphere_properties(diameter=-5.0)
    with pytest.raises(ValueError):
        calculate_sphere_properties(diameter=0)
    with pytest.raises(ValueError):
        calculate_sphere_properties(diameter=10, density=-1.0)
    with pytest.raises(ValueError):
        calculate_sphere_properties(diameter=10, diameter_unit="invalid_unit")
