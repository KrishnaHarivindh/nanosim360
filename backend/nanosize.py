"""
NanoSize: Particle Population Statistics & Monte Carlo Uncertainty Engine.
Simulates realistic polydisperse nanoparticle samples (Log-normal & Gaussian distributions),
number-weighted vs. volume-weighted diameter analysis, and Monte Carlo propagation of measurement uncertainty.
"""

import math
import numpy as np
from typing import Dict, Any, List

def simulate_particle_size_distribution(
    distribution_type: str = "lognormal",
    mean_diameter_nm: float = 20.0,
    std_dev_nm: float = 3.0,
    sample_size: int = 5000,
    material_density_g_cm3: float = 19.32
) -> Dict[str, Any]:
    """
    Simulates a polydisperse ensemble of nanoparticles and computes:
    - Number-weighted mean & median
    - Volume-weighted (D4,3 De Brouckere) mean
    - Specific Surface Area (SSA) integrated across the polydisperse distribution
    - Monte Carlo uncertainty bounds (95% confidence interval)
    """
    if not math.isfinite(mean_diameter_nm) or mean_diameter_nm <= 0:
        raise ValueError("Mean diameter must be positive.")
    if not math.isfinite(std_dev_nm) or std_dev_nm < 0:
        raise ValueError("Standard deviation cannot be negative.")
    if not math.isfinite(material_density_g_cm3) or material_density_g_cm3 <= 0:
        raise ValueError("Density must be positive.")
    if distribution_type.lower() not in {"lognormal", "gaussian"}:
        raise ValueError("Distribution type must be 'lognormal' or 'gaussian'.")
    if isinstance(sample_size, bool) or not isinstance(sample_size, int) or not 100 <= sample_size <= 20000:
        raise ValueError("Sample size must be an integer from 100 to 20000.")

    rng = np.random.default_rng(42)
    sample_n = sample_size

    if distribution_type.lower() == "lognormal":
        # Parameterize log-normal distribution:
        # sigma_log = sqrt(ln(1 + (std/mean)^2))
        # mu_log = ln(mean) - 0.5 * sigma_log^2
        variance_ratio = (std_dev_nm / mean_diameter_nm) ** 2
        sigma_log = math.sqrt(math.log(1.0 + variance_ratio))
        mu_log = math.log(mean_diameter_nm) - 0.5 * (sigma_log ** 2)
        diameters = rng.lognormal(mean=mu_log, sigma=sigma_log, size=sample_n)
    else:
        # Gaussian distribution truncated at positive values
        diameters = rng.normal(loc=mean_diameter_nm, scale=std_dev_nm, size=sample_n)
        diameters = np.clip(diameters, 0.5, None)

    # Number-weighted statistics
    d_mean = float(np.mean(diameters))
    d_std = float(np.std(diameters))
    d_median = float(np.median(diameters))
    cv_percent = (d_std / d_mean) * 100.0 if d_mean > 0 else 0.0

    # Volume and Area weighting
    # Particle volume: V_i = (pi/6) * d_i^3
    # Particle area: A_i = pi * d_i^2
    # Specific surface area across distribution: SSA = Sum(A_i) / Sum(rho * V_i)
    volumes_nm3 = (math.pi / 6.0) * (diameters ** 3)
    areas_nm2 = math.pi * (diameters ** 2)

    total_volume_nm3 = float(np.sum(volumes_nm3))
    total_area_nm2 = float(np.sum(areas_nm2))

    # Density in g/nm3: rho_g_cm3 * 1e-21
    rho_g_nm3 = material_density_g_cm3 * 1e-21
    total_mass_g = total_volume_nm3 * rho_g_nm3

    # Total area in m2: total_area_nm2 * 1e-18
    # Polydisperse SSA (m2/g) = total_area_m2 / total_mass_g
    polydisperse_ssa_m2_g = (total_area_nm2 * 1e-18) / total_mass_g if total_mass_g > 0 else 0.0

    # Volume-weighted diameter (D4,3): Sum(d^4) / Sum(d^3)
    d4_3 = float(np.sum(diameters ** 4) / np.sum(diameters ** 3))

    # Monte Carlo 95% Confidence Interval for SSA via bootstrapping
    boot_samples = 200
    boot_ssas = []
    for _ in range(boot_samples):
        idx = rng.choice(sample_n, size=sample_n, replace=True)
        boot_a = np.sum(areas_nm2[idx]) * 1e-18
        boot_m = np.sum(volumes_nm3[idx]) * rho_g_nm3
        boot_ssas.append(boot_a / boot_m)

    ci_lower = float(np.percentile(boot_ssas, 2.5))
    ci_upper = float(np.percentile(boot_ssas, 97.5))

    # Histogram Bins (8 bins)
    hist, bin_edges = np.histogram(diameters, bins=8)
    histogram_data = [
        {
            "bin_range": f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f} nm",
            "count": int(hist[i]),
            "percentage": round(float((hist[i] / sample_n) * 100.0), 1)
        }
        for i in range(len(hist))
    ]

    # Monodisperse ideal comparison
    ideal_monodisperse_ssa = 6.0 / (material_density_g_cm3 * (mean_diameter_nm * 1e-7)) / 1e4

    return {
        "distribution_model": distribution_type.title(),
        "sample_count": sample_n,
        "number_weighted": {
            "mean_diameter_nm": round(d_mean, 2),
            "median_diameter_nm": round(d_median, 2),
            "std_dev_nm": round(d_std, 2),
            "coefficient_of_variation_pct": round(cv_percent, 1)
        },
        "volume_weighted": {
            "d4_3_mean_diameter_nm": round(d4_3, 2),
            "volume_surface_d3_2_sauter_nm": round(float(np.sum(diameters ** 3) / np.sum(diameters ** 2)), 2)
        },
        "polydisperse_specific_surface_area": {
            "value_m2_g": round(polydisperse_ssa_m2_g, 2),
            "monodisperse_ideal_baseline_m2_g": round(ideal_monodisperse_ssa, 2),
            "polydispersity_effect_ratio": round(polydisperse_ssa_m2_g / ideal_monodisperse_ssa, 3) if ideal_monodisperse_ssa > 0 else 1.0,
            "monte_carlo_95_ci_m2_g": [round(ci_lower, 2), round(ci_upper, 2)]
        },
        "histogram": histogram_data,
        "scientific_insight": "Polydispersity shifts real specific surface area compared to single-diameter approximations because smaller nanoparticles disproportionately dominate the collective surface area."
    }
