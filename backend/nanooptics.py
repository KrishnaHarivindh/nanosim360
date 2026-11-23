"""
NanoOptics Engine: Mie Theory & Plasmonic Light Scattering Simulator.
Calculates wavelength-dependent extinction, scattering, and absorption cross-sections
and localized surface plasmon resonance (LSPR) for Gold and Silver spherical nanoparticles.

References:
- Johnson, P. B., & Christy, R. W. (1972). Optical constants of the noble metals. Phys. Rev. B, 6(12), 4370.
- Bohren, C. F., & Huffman, D. R. (1983). Absorption and Scattering of Light by Small Particles.
"""

import math
from typing import Dict, Any, List

# Interpolated Johnson & Christy dielectric function values (eps1, eps2) for Gold (Au) and Silver (Ag)
# Format: wavelength_nm: (eps1, eps2)
JC_OPTICAL_DATA_GOLD = {
    400: (-1.68, 5.72),
    425: (-1.82, 5.34),
    450: (-2.24, 4.88),
    475: (-2.89, 4.21),
    500: (-3.78, 3.42),
    520: (-4.86, 2.82), # Typical LSPR resonance window
    540: (-6.21, 2.34),
    560: (-7.84, 1.98),
    580: (-9.64, 1.72),
    600: (-11.60, 1.54),
    625: (-14.28, 1.38),
    650: (-17.15, 1.29),
    700: (-23.40, 1.25),
    750: (-30.20, 1.35),
    800: (-37.50, 1.52)
}

JC_OPTICAL_DATA_SILVER = {
    350: (-1.22, 0.42),
    375: (-2.68, 0.32),
    400: (-4.62, 0.22), # Strong UV/Blue Ag LSPR
    425: (-6.82, 0.24),
    450: (-9.24, 0.28),
    475: (-11.85, 0.34),
    500: (-14.62, 0.41),
    550: (-20.80, 0.58),
    600: (-27.80, 0.78),
    650: (-35.50, 1.02),
    700: (-44.00, 1.30)
}

def simulate_lspr_mie(
    material: str = "gold",
    diameter_nm: float = 20.0,
    medium_refractive_index: float = 1.333 # Water (default)
) -> Dict[str, Any]:
    """
    Computes quasistatic dipole Mie approximation cross-sections for a small spherical nanoparticle (d << lambda):
    Polarizability:
    alpha = 4 * pi * epsilon_0 * r^3 * ((eps_m - eps_d) / (eps_m + 2 * eps_d))
    Extinction Cross Section:
    C_ext = 4 * pi * k * r^3 * Im((eps_m - eps_d) / (eps_m + 2 * eps_d))
    Scattering Cross Section:
    C_sca = (8 * pi / 3) * k^4 * r^6 * |(eps_m - eps_d) / (eps_m + 2 * eps_d)|^2
    Absorption Cross Section:
    C_abs = C_ext - C_sca
    """
    if diameter_nm <= 0:
        raise ValueError("Nanoparticle diameter must be positive.")
    if medium_refractive_index <= 0:
        raise ValueError("Surrounding refractive index must be positive.")

    material_lower = material.lower()
    if "silver" in material_lower or "ag" in material_lower:
        optical_dict = JC_OPTICAL_DATA_SILVER
        mat_label = "Silver (Ag)"
    else:
        optical_dict = JC_OPTICAL_DATA_GOLD
        mat_label = "Gold (Au)"

    r_nm = diameter_nm / 2.0
    r_m = r_nm * 1e-9
    eps_d = medium_refractive_index ** 2  # Dielectric constant of surrounding medium

    spectrum_wavelengths: List[int] = []
    c_ext_list: List[float] = []
    c_abs_list: List[float] = []
    c_sca_list: List[float] = []

    peak_wavelength = 0
    max_c_ext = -1.0

    for wl_nm, (eps1, eps2) in optical_dict.items():
        wl_m = wl_nm * 1e-9
        k = (2.0 * math.pi * medium_refractive_index) / wl_m

        # Complex fraction: F = (eps_m - eps_d) / (eps_m + 2*eps_d)
        # where eps_m = eps1 + i*eps2
        num_re = eps1 - eps_d
        num_im = eps2
        den_re = eps1 + 2.0 * eps_d
        den_im = eps2
        den_mag_sq = den_re**2 + den_im**2

        if den_mag_sq == 0:
            continue

        f_re = (num_re * den_re + num_im * den_im) / den_mag_sq
        f_im = (num_im * den_re - num_re * den_im) / den_mag_sq
        f_mag_sq = f_re**2 + f_im**2

        # Cross sections (m²)
        c_ext_m2 = 4.0 * math.pi * k * (r_m ** 3) * f_im
        c_sca_m2 = (8.0 * math.pi / 3.0) * (k ** 4) * (r_m ** 6) * f_mag_sq
        c_abs_m2 = max(0.0, c_ext_m2 - c_sca_m2)

        # Convert to nm² for intuitive nanoscale reporting
        c_ext_nm2 = c_ext_m2 * 1e18
        c_abs_nm2 = c_abs_m2 * 1e18
        c_sca_nm2 = c_sca_m2 * 1e18

        spectrum_wavelengths.append(wl_nm)
        c_ext_list.append(round(c_ext_nm2, 2))
        c_abs_list.append(round(c_abs_nm2, 2))
        c_sca_list.append(round(c_sca_nm2, 2))

        if c_ext_nm2 > max_c_ext:
            max_c_ext = c_ext_nm2
            peak_wavelength = wl_nm

    return {
        "material": mat_label,
        "diameter_nm": diameter_nm,
        "medium_refractive_index": medium_refractive_index,
        "medium_name": "Aqueous / Physiological buffer" if abs(medium_refractive_index - 1.333) < 0.05 else f"n = {medium_refractive_index}",
        "lspr_resonance_peak_nm": peak_wavelength,
        "max_extinction_cross_section_nm2": round(max_c_ext, 2),
        "spectra": {
            "wavelengths_nm": spectrum_wavelengths,
            "extinction_cross_section_nm2": c_ext_list,
            "absorption_cross_section_nm2": c_abs_list,
            "scattering_cross_section_nm2": c_sca_list,
        },
        "optical_constants_provenance": "Johnson & Christy (1972) noble metal dielectric functions (400-800 nm).",
        "scientific_caveat": "Quasistatic dipolar approximation assumes homogeneous spherical particle diameter << incident wavelength without multipolar retardation."
    }
