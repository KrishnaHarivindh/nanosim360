import pytest
import math
import io
from PIL import Image, ImageDraw
from scipy.special import spherical_jn, spherical_yn
from backend.full_mie import compute_mie_coefficients, simulate_full_mie_vs_dipole
from backend.nanooptics import JC_OPTICAL_DATA_GOLD
from backend.nanosize import simulate_particle_size_distribution
from backend.nanostructure_studio import generate_graphene_coordinates, generate_c60_fullerene
from backend.nanodesign import recommend_nanomaterial
from backend.nanocharacterize import analyze_micrograph_particles

def test_full_mie_convergence_small_particles():
    res = simulate_full_mie_vs_dipole(material="gold", diameter_nm=20.0, medium_refractive_index=1.333)
    assert res["peak_resonance_wavelength_nm"] in [500, 520, 540]
    assert "spectra" in res
    assert len(res["spectra"]["full_mie_extinction_nm2"]) > 0

def test_mie_coefficients_match_independent_scipy_reference():
    # Gold 20 nm sphere in water at 520 nm, using the project's tabulated
    # dielectric value. Compare the production recurrence with direct SciPy
    # spherical-Bessel evaluations of the same Mie series.
    wl_nm, diameter_nm, n_medium = 520.0, 20.0, 1.333
    epsilon = complex(*JC_OPTICAL_DATA_GOLD[int(wl_nm)])
    relative_index = epsilon ** 0.5 / n_medium
    x = 2 * math.pi * n_medium * (diameter_nm / 2) / wl_nm

    q_ext_ref = q_sca_ref = 0.0
    n_max = int(round(x + 4 * x ** (1 / 3) + 2))
    for n in range(1, n_max + 1):
        def values(z):
            j, y = spherical_jn(n, z), spherical_yn(n, z)
            dj, dy = spherical_jn(n, z, derivative=True), spherical_yn(n, z, derivative=True)
            h, dh = j + 1j * y, dj + 1j * dy
            return z * j, j + z * dj, z * h, h + z * dh

        psi_x, dpsi_x, xi_x, dxi_x = values(x)
        psi_mx, dpsi_mx, _, _ = values(relative_index * x)
        a_n = (relative_index * psi_mx * dpsi_x - psi_x * dpsi_mx) / (relative_index * psi_mx * dxi_x - xi_x * dpsi_mx)
        b_n = (psi_mx * dpsi_x - relative_index * psi_x * dpsi_mx) / (psi_mx * dxi_x - relative_index * xi_x * dpsi_mx)
        q_ext_ref += (2 * n + 1) * (a_n.real + b_n.real)
        q_sca_ref += (2 * n + 1) * (abs(a_n) ** 2 + abs(b_n) ** 2)
    q_ext_ref *= 2 / x**2
    q_sca_ref *= 2 / x**2

    q_ext, q_sca, q_abs = compute_mie_coefficients(relative_index, x)
    assert q_ext == pytest.approx(q_ext_ref, rel=1e-10)
    assert q_sca == pytest.approx(q_sca_ref, rel=1e-10)
    assert q_abs == pytest.approx(q_ext - q_sca, rel=1e-10)

def test_mie_efficiencies_match_published_miev0_case():
    # Du, Applied Optics 43 (2004), Table 1, case k (Wiscombe MIEV0):
    # m=10-10i, x=1, Qext=2.53299308, Qsca=2.04940501.
    # This solver uses the conjugate passive-index convention (+10i).
    q_ext, q_sca, q_abs = compute_mie_coefficients(10 + 10j, 1.0)
    assert q_ext == pytest.approx(2.53299308, abs=5e-9)
    assert q_sca == pytest.approx(2.04940501, abs=5e-9)
    assert q_abs == pytest.approx(0.48358807, abs=1e-8)

def test_full_mie_retardation_large_particles():
    # For 50 nm gold, dynamic retardation and higher-order multipoles cause significant deviation from dipole model
    res = simulate_full_mie_vs_dipole(material="gold", diameter_nm=50.0, medium_refractive_index=1.333)
    assert res["dipole_approximation_deviation_pct"] > 20.0

def test_nanosize_monte_carlo_distribution():
    # Lognormal distribution test (Mean = 20 nm, Std = 3.0 nm)
    res = simulate_particle_size_distribution(distribution_type="lognormal", mean_diameter_nm=20.0, std_dev_nm=3.0)
    assert res["number_weighted"]["mean_diameter_nm"] > 18.0
    assert len(res["histogram"]) > 0
    ci = res["polydisperse_specific_surface_area"]["monte_carlo_95_ci_m2_g"]
    assert ci[0] < res["polydisperse_specific_surface_area"]["value_m2_g"] < ci[1]

def test_nanosize_rejects_invalid_model_and_preserves_requested_sample_count():
    with pytest.raises(ValueError):
        simulate_particle_size_distribution(distribution_type="uniform")
    result = simulate_particle_size_distribution(sample_size=100)
    assert result["sample_count"] == 100

def test_tem_micrograph_detects_particles_and_rejects_blank_images():
    image = Image.new("L", (80, 60), 255)
    draw = ImageDraw.Draw(image)
    draw.ellipse((10, 10, 24, 24), fill=20)
    draw.ellipse((35, 18, 49, 32), fill=20)
    draw.ellipse((58, 38, 72, 52), fill=20)
    image_bytes = io.BytesIO()
    image.save(image_bytes, format="PNG")

    result = analyze_micrograph_particles(image_bytes.getvalue(), nm_per_pixel=0.25)
    assert result["particle_count"] == 3
    assert result["mean_diameter_nm"] == pytest.approx(3.75, abs=0.05)

    blank = Image.new("L", (40, 40), 255)
    blank_bytes = io.BytesIO()
    blank.save(blank_bytes, format="PNG")
    with pytest.raises(ValueError, match="No particles were detected"):
        analyze_micrograph_particles(blank_bytes.getvalue())

def test_nanostructure_studio_graphene_doping():
    res = generate_graphene_coordinates(nx=4, ny=4, dopant_element="N", dopant_ratio=0.1)
    assert res["total_atoms"] == 32
    assert res["doped_atoms_count"] > 0
    assert "xyz_format" in res
    assert "C" in res["xyz_format"] and "N" in res["xyz_format"]

def test_nanostructure_studio_c60():
    res = generate_c60_fullerene()
    assert res["total_atoms"] == 60
    assert res["mean_cage_radius_angstrom"] == 3.55
    assert len(res["xyz_format"].splitlines()) == 62
    points = [(a["x"], a["y"], a["z"]) for a in res["atoms"]]
    nearest_bonds = [min(math.dist(p, q) for j, q in enumerate(points) if j != i) for i, p in enumerate(points)]
    assert min(nearest_bonds) == pytest.approx(1.433, abs=0.002)
    assert max(nearest_bonds) == pytest.approx(1.433, abs=0.002)

def test_nanodesign_topsis_rankings():
    res = recommend_nanomaterial(target_application="photocatalysis")
    assert res["algorithm"].startswith("Technique for Order Preference")
    assert res["top_recommended_candidate"] == "Titanium Dioxide (TiO2)"
    assert res["rankings"][0]["utility_score"] > res["rankings"][-1]["utility_score"]
    assert "heuristic inputs" in res["methodology_note"]
