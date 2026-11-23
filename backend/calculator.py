"""
Scientific calculation engine for NanoSim 360.
All units are explicitly defined and converted to SI base units internally.

Key Updates:
1. Distinguishes Surface-Area-to-Volume Ratio (SA/V = 6/d, unit: nm⁻¹ or m⁻¹)
   from Specific Surface Area (SSA = A/m = 6/(ρ * d), unit: m²/g or m²/kg).
2. Rigorous Carbon Nanotube Chiral Geometry derivation:
   dt = (a / π) * sqrt(n² + n*m + m²)
   Chiral angle θ = arctan(sqrt(3)*m / (2n + m))
   Roll-up vector length C_h = π * dt
   Type: Metallic if (2n + m) % 3 == 0 (or (n - m) % 3 == 0), else Semiconducting.
"""
import math
from typing import Dict, Any, Tuple

# Length conversion multipliers to meters (m)
LENGTH_TO_M = {
    "m": 1.0,
    "cm": 1e-2,
    "mm": 1e-3,
    "um": 1e-6,
    "µm": 1e-6,
    "nm": 1e-9,
    "angstrom": 1e-10,
    "Å": 1e-10,
    "pm": 1e-12,
}

# Mass conversion multipliers to kilograms (kg)
MASS_TO_KG = {
    "kg": 1.0,
    "g": 1e-3,
    "mg": 1e-6,
    "ug": 1e-9,
    "µg": 1e-9,
    "ng": 1e-12,
}

# Density conversion multipliers to kg/m³
DENSITY_TO_KG_M3 = {
    "kg/m3": 1.0,
    "g/cm3": 1000.0,
    "g/ml": 1000.0,
}

# Carbon lattice constant in graphene: a = sqrt(3) * a_cc = sqrt(3) * 0.1421 nm ≈ 0.2461 nm
A_GRAPHENE_NM = 0.2461
A_CC_BOND_NM = 0.1421  # carbon-carbon bond length


def convert_length(value: float, from_unit: str, to_unit: str) -> float:
    """Convert length between arbitrary supported units."""
    if from_unit not in LENGTH_TO_M or to_unit not in LENGTH_TO_M:
        raise ValueError(f"Unsupported unit conversion: {from_unit} -> {to_unit}")
    meters = value * LENGTH_TO_M[from_unit]
    return meters / LENGTH_TO_M[to_unit]


def convert_mass(value: float, from_unit: str, to_unit: str) -> float:
    """Convert mass between arbitrary supported units."""
    if from_unit not in MASS_TO_KG or to_unit not in MASS_TO_KG:
        raise ValueError(f"Unsupported unit conversion: {from_unit} -> {to_unit}")
    kg = value * MASS_TO_KG[from_unit]
    return kg / MASS_TO_KG[to_unit]


def calculate_sphere_properties(
    diameter: float, 
    diameter_unit: str = "nm", 
    density: float = 19.32, 
    density_unit: str = "g/cm3"
) -> Dict[str, Any]:
    """
    Calculate geometric and physical properties of a spherical nanoparticle.
    
    Equations:
    - Radius: r = d / 2
    - Volume: V = (4/3) * π * r³
    - Surface Area: A = 4 * π * r²
    - Surface-Area-to-Volume Ratio: SA/V = 6 / d = 3 / r  (Unit: nm⁻¹ or m⁻¹)
    - Specific Surface Area (SSA): SSA = A / m = 6 / (ρ * d) (Unit: m²/g or m²/kg)
    - Particle Mass: m = ρ * V
    """
    if not math.isfinite(diameter) or diameter <= 0:
        raise ValueError("Particle diameter must be strictly positive.")
    if not math.isfinite(density) or density <= 0:
        raise ValueError("Material density must be strictly positive.")
    if diameter_unit not in LENGTH_TO_M:
        raise ValueError(f"Invalid diameter unit: {diameter_unit}")
    if density_unit not in DENSITY_TO_KG_M3:
        raise ValueError(f"Invalid density unit: {density_unit}")

    # SI conversion
    d_m = diameter * LENGTH_TO_M[diameter_unit]
    r_m = d_m / 2.0
    rho_si = density * DENSITY_TO_KG_M3[density_unit]  # kg/m³

    # Fundamental geometry in SI
    volume_m3 = (4.0 / 3.0) * math.pi * (r_m ** 3)
    surface_area_m2 = 4.0 * math.pi * (r_m ** 2)
    sa_to_vol_m_inv = 6.0 / d_m
    mass_kg = rho_si * volume_m3

    # Specific Surface Area: SSA = A / m = 6 / (rho * d)
    # in m²/kg
    ssa_m2_kg = surface_area_m2 / mass_kg  # or 6.0 / (rho_si * d_m)
    # in m²/g (frequently used in BET nitrogen adsorption literature)
    ssa_m2_g = ssa_m2_kg / 1000.0

    # Nanoscale normalized representations
    volume_nm3 = volume_m3 * 1e27
    surface_area_nm2 = surface_area_m2 * 1e18
    sa_to_vol_nm_inv = 6.0 / (d_m * 1e9)
    mass_g = mass_kg * 1e3

    return {
        "inputs": {
            "diameter": diameter,
            "diameter_unit": diameter_unit,
            "diameter_meters": d_m,
            "density": density,
            "density_unit": density_unit,
            "density_kg_m3": rho_si,
        },
        "radius": {
            "value_nm": r_m * 1e9,
            "value_m": r_m,
            "formula": "r = d / 2",
            "derivation_step": f"r = {diameter} {diameter_unit} / 2 = {r_m*1e9:.4f} nm",
        },
        "volume": {
            "value_nm3": volume_nm3,
            "value_m3": volume_m3,
            "formula": "V = (4/3) * π * r³",
            "derivation_step": f"V = (4/3) * π * ({r_m*1e9:.2f} nm)³ = {volume_nm3:.4e} nm³",
        },
        "surface_area": {
            "value_nm2": surface_area_nm2,
            "value_m2": surface_area_m2,
            "formula": "A = 4 * π * r²",
            "derivation_step": f"A = 4 * π * ({r_m*1e9:.2f} nm)² = {surface_area_nm2:.4e} nm²",
        },
        "surface_area_to_volume_ratio": {
            "value_nm_inv": sa_to_vol_nm_inv,
            "value_m_inv": sa_to_vol_m_inv,
            "unit": "nm⁻¹",
            "formula": "SA/V = 6 / d = 3 / r",
            "derivation_step": f"SA/V = 6 / ({diameter} {diameter_unit}) = {sa_to_vol_nm_inv:.4f} nm⁻¹ (or {sa_to_vol_m_inv:.2e} m⁻¹)",
        },
        "specific_surface_area": {
            "value_m2_g": ssa_m2_g,
            "value_m2_kg": ssa_m2_kg,
            "unit": "m²/g",
            "formula": "SSA = A / m = 6 / (ρ * d)",
            "derivation_step": f"SSA = 6 / ({rho_si:.1f} kg/m³ * {d_m:.2e} m) = {ssa_m2_g:.2f} m²/g",
        },
        "particle_mass": {
            "value_g": mass_g,
            "value_kg": mass_kg,
            "formula": "m = ρ * V",
            "derivation_step": f"m = {rho_si:.1f} kg/m³ * {volume_m3:.2e} m³ = {mass_g:.4e} g",
        },
        "assumptions": [
            "Ideal monodisperse spherical geometry",
            "Homogeneous bulk density throughout the nanoparticle core",
            "Specific surface area calculation neglects intra-particle nanoporosity and hydration layers",
        ],
    }


def calculate_particle_population(
    total_mass: float,
    total_mass_unit: str,
    single_particle_mass_kg: float,
    single_particle_area_m2: float = 0.0
) -> Dict[str, Any]:
    """
    Calculate particle count and total cumulative surface area for a sample mass.
    """
    if total_mass <= 0:
        raise ValueError("Total sample mass must be strictly positive.")
    if single_particle_mass_kg <= 0:
        raise ValueError("Single particle mass must be strictly positive.")
    if total_mass_unit not in MASS_TO_KG:
        raise ValueError(f"Invalid total mass unit: {total_mass_unit}")

    total_mass_kg = total_mass * MASS_TO_KG[total_mass_unit]
    particle_count = total_mass_kg / single_particle_mass_kg
    total_area_m2 = particle_count * single_particle_area_m2 if single_particle_area_m2 > 0 else 0.0

    return {
        "total_mass_kg": total_mass_kg,
        "single_particle_mass_kg": single_particle_mass_kg,
        "particle_count": particle_count,
        "total_cumulative_surface_area_m2": total_area_m2,
        "formula": "N = M_total / m_particle",
        "scientific_notation": f"{particle_count:.4e}",
    }


def calculate_cnt_chiral_geometry(n: int, m: int, length_nm: float = 5.0) -> Dict[str, Any]:
    """
    Calculate exact geometric & electronic parameters for a Single-Walled Carbon Nanotube (SWCNT)
    specified by chiral vector indices (n, m).
    
    Formulas:
    Chiral vector length: C_h = a * sqrt(n² + nm + m²)  where a ≈ 0.2461 nm
    Diameter: d_t = C_h / π = (a / π) * sqrt(n² + nm + m²)
    Chiral angle: θ = arctan(sqrt(3)*m / (2n + m))  (in degrees, range 0° to 30°)
    Classification:
      - Zigzag if m == 0 (θ = 0°)
      - Armchair if n == m (θ = 30°)
      - Chiral if 0 < m < n
    Electronic Character:
      - Metallic if (2n + m) % 3 == 0 (or (n - m) % 3 == 0)
      - Semiconducting if (2n + m) % 3 != 0
    """
    if isinstance(n, bool) or isinstance(m, bool) or not isinstance(n, int) or not isinstance(m, int) or n < 0 or m < 0:
        raise ValueError("Chiral indices n and m must be non-negative integers.")
    if not math.isfinite(length_nm) or length_nm <= 0:
        raise ValueError("Nanotube length must be finite and strictly positive.")
    if n == 0 and m == 0:
        raise ValueError("Indices (0,0) do not construct a nanotube.")
    # Standard convention: n >= m
    if m > n:
        n, m = m, n

    # Chiral vector length in nm
    c_h_nm = A_GRAPHENE_NM * math.sqrt(n**2 + n*m + m**2)
    # Diameter in nm: dt = Ch / pi
    diameter_nm = c_h_nm / math.pi
    radius_nm = diameter_nm / 2.0

    # Chiral angle theta in radians & degrees
    denom = 2 * n + m
    if denom == 0:
        theta_deg = 0.0
    else:
        theta_rad = math.atan((math.sqrt(3.0) * m) / denom)
        theta_deg = math.degrees(theta_rad)

    # Classification
    if m == 0:
        tube_class = "Zigzag"
    elif n == m:
        tube_class = "Armchair"
    else:
        tube_class = "Chiral"

    # Electronic character rule:
    # If (n - m) % 3 == 0 -> Nominally Metallic under zone-folding.
    # Armchair tubes (n == m) are true metals with crossing bands at Fermi level.
    # Non-armchair tubes with (n - m) % 3 == 0 have small secondary curvature gaps (~10-50 meV).
    # If (n - m) % 3 != 0 -> Moderate semiconductor with Eg ≈ 0.84 / dt.
    is_armchair = (n == m)
    is_zone_folding_metallic = ((n - m) % 3 == 0)

    if is_armchair:
        electronic_character = "True Metallic (Armchair, no bandgap)"
        approx_bandgap_ev = 0.0
        caveat = "Metallic in the ideal armchair zone-folding model; defects, contacts, and environment can affect transport."
    elif is_zone_folding_metallic:
        electronic_character = "Quasi-Metallic / Small-Gap Semiconductor"
        # Curvature effect opens a tiny gap: Eg_curvature ≈ 0.04 eV / dt^2
        approx_bandgap_ev = 0.04 / (diameter_nm ** 2)
        caveat = "Zone-folding predicts metallic, but graphene sheet curvature opens a secondary mini-gap (~10-40 meV)."
    else:
        electronic_character = "Semiconducting (Primary bandgap)"
        approx_bandgap_ev = 0.84 / diameter_nm
        caveat = "True semiconducting nanotube governed by standard 1D subband separation."

    surface_area_cylinder_nm2 = math.pi * diameter_nm * length_nm
    approx_carbon_atoms = int(round(surface_area_cylinder_nm2 * 38.0))

    return {
        "chiral_indices": {"n": n, "m": m},
        "diameter_nm": diameter_nm,
        "radius_nm": radius_nm,
        "chiral_vector_length_nm": c_h_nm,
        "chiral_angle_deg": theta_deg,
        "classification": tube_class,
        "electronic_character": electronic_character,
        "is_metallic": is_armchair or is_zone_folding_metallic,
        "is_true_metallic_armchair": is_armchair,
        "estimated_bandgap_ev": approx_bandgap_ev,
        "length_nm": length_nm,
        "approx_carbon_atoms": approx_carbon_atoms,
        "scientific_caveats": caveat,
        "formulas": {
            "diameter": "d_t = (a / π) * √(n² + n*m + m²)",
            "chiral_angle": "θ = arctan(√3*m / (2n + m))",
            "metallicity_condition": "Metallic if (n - m) mod 3 = 0 (with curvature caveats), else Semiconducting",
        },
        "derivation_steps": [
            f"Given chiral indices (n={n}, m={m}) and graphene lattice constant a = {A_GRAPHENE_NM} nm",
            f"Chiral vector magnitude C_h = {A_GRAPHENE_NM} * √({n}² + {n}*{m} + {m}²) = {c_h_nm:.4f} nm",
            f"Nanotube diameter d_t = C_h / π = {diameter_nm:.4f} nm (Radius r = {radius_nm:.4f} nm)",
            f"Chiral angle θ = {theta_deg:.2f}° → {tube_class} structure",
            f"Zone-folding check: ({n} - {m}) mod 3 = {(n - m) % 3} → {electronic_character} ({caveat})",
        ]
    }
