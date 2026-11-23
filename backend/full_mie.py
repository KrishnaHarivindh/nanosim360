"""
Full Mie Theory Core & Dipole Comparison Solver.
Implements the exact series summation for spherical particles:
Q_ext = (2 / x^2) * sum_{n=1}^{N_max} (2n + 1) * Re(a_n + b_n)
Q_sca = (2 / x^2) * sum_{n=1}^{N_max} (2n + 1) * (|a_n|^2 + |b_n|^2)
Q_abs = Q_ext - Q_sca
Cross sections: C_i = Q_i * pi * r^2

Riccati-Bessel functions psi_n(z) and xi_n(z) are computed via stable recurrence relations:
psi_n(z) = z * j_n(z)
xi_n(z) = z * h_n^(1)(z) = psi_n(z) - i * chi_n(z)

References:
- Bohren, C. F., & Huffman, D. R. (1983). Absorption and Scattering of Light by Small Particles.
- Wiscombe, W. J. (1980). Improved Mie scattering algorithms. Applied Optics, 19(9), 1505-1509.
"""

import cmath
import math
from typing import Dict, Any, List, Tuple
from backend.nanooptics import JC_OPTICAL_DATA_GOLD, JC_OPTICAL_DATA_SILVER

def riccati_bessel(n_max: int, z: complex) -> Tuple[List[complex], List[complex], List[complex], List[complex]]:
    """
    Computes Riccati-Bessel functions psi_n(z), xi_n(z) and their derivatives psi'_n(z), xi'_n(z)
    up to order n_max using recurrence formulas.
    """
    psi = [complex(0.0, 0.0)] * (n_max + 1)
    dpsi = [complex(0.0, 0.0)] * (n_max + 1)
    xi = [complex(0.0, 0.0)] * (n_max + 1)
    dxi = [complex(0.0, 0.0)] * (n_max + 1)

    # Base cases for n=0
    # psi_0(z) = sin(z), xi_0(z) = sin(z) - i * cos(z) = -i * exp(i*z)
    sin_z = cmath.sin(z)
    cos_z = cmath.cos(z)
    exp_iz = cmath.exp(1j * z)

    psi_prev = sin_z
    psi_curr = sin_z / z - cos_z if abs(z) > 1e-12 else z / 3.0
    
    # xi_n = z*h_n^(1)(z): xi_0 = -i*exp(i*z), xi_1 = -(1 + i/z)*exp(i*z)
    xi_prev = -1j * exp_iz
    xi_curr = (-1.0 - 1j / z) * exp_iz if abs(z) > 1e-12 else -1j * exp_iz

    psi[1] = psi_curr
    xi[1] = xi_curr
    dpsi[1] = psi_prev - (1.0 / z) * psi_curr
    dxi[1] = xi_prev - (1.0 / z) * xi_curr

    for n in range(2, n_max + 1):
        # Recurrence: f_{n}(z) = ((2n - 1) / z) * f_{n-1}(z) - f_{n-2}(z)
        psi_next = ((2 * n - 1) / z) * psi[n - 1] - psi[n - 2] if n > 2 else ((3.0 / z) * psi[1] - psi_prev)
        xi_next = ((2 * n - 1) / z) * xi[n - 1] - xi[n - 2] if n > 2 else ((3.0 / z) * xi[1] - xi_prev)
        
        psi[n] = psi_next
        xi[n] = xi_next
        dpsi[n] = psi[n - 1] - (n / z) * psi_next
        dxi[n] = xi[n - 1] - (n / z) * xi_next

    return psi, dpsi, xi, dxi


def compute_mie_coefficients(m: complex, x: float) -> Tuple[float, float, float]:
    """
    Computes Q_ext, Q_sca, and Q_abs for size parameter x and relative refractive index m = n_particle / n_medium.
    Wiscombe criterion for stopping order: N_stop = round(x + 4 * x^(1/3) + 2)
    """
    if x <= 1e-6:
        return 0.0, 0.0, 0.0

    # Wiscombe criterion for stopping order: N_stop = round(x + 4 * x^(1/3) + 2)
    # For small x (Rayleigh regime), evaluate through dipole + quadrupole (n=1, 2)
    n_stop = int(round(x + 4.0 * (x ** (1.0 / 3.0)) + 2.0))
    n_max = max(2, min(20, n_stop))
    z = complex(x, 0.0)
    y = m * z

    psi_z, dpsi_z, xi_z, dxi_z = riccati_bessel(n_max, z)
    psi_y, dpsi_y, _, _ = riccati_bessel(n_max, y)

    q_ext = 0.0
    q_sca = 0.0

    for n in range(1, n_max + 1):
        num_a = m * psi_y[n] * dpsi_z[n] - psi_z[n] * dpsi_y[n]
        den_a = m * psi_y[n] * dxi_z[n] - xi_z[n] * dpsi_y[n]
        a_n = num_a / den_a if abs(den_a) > 1e-18 else complex(0.0, 0.0)

        num_b = psi_y[n] * dpsi_z[n] - m * psi_z[n] * dpsi_y[n]
        den_b = psi_y[n] * dxi_z[n] - m * xi_z[n] * dpsi_y[n]
        b_n = num_b / den_b if abs(den_b) > 1e-18 else complex(0.0, 0.0)

        weight = 2.0 * n + 1.0
        q_ext += weight * (a_n.real + b_n.real)
        q_sca += weight * (abs(a_n) ** 2 + abs(b_n) ** 2)

    factor = 2.0 / (x ** 2)
    q_ext *= factor
    q_sca *= factor
    q_abs = max(0.0, q_ext - q_sca)

    return q_ext, q_sca, q_abs


def simulate_full_mie_vs_dipole(
    material: str = "gold",
    diameter_nm: float = 30.0,
    medium_refractive_index: float = 1.333
) -> Dict[str, Any]:
    """
    Computes comparative optical response:
    1. Full Multipole Mie Theory (Bohren-Huffman exact series)
    2. Small-particle Dipole (Rayleigh) approximation
    Reports cross-sections in nm², efficiencies Q, and validity analysis.
    """
    optical_dict = JC_OPTICAL_DATA_SILVER if "silver" in material.lower() or "ag" in material.lower() else JC_OPTICAL_DATA_GOLD
    r_nm = diameter_nm / 2.0
    geom_area_nm2 = math.pi * (r_nm ** 2)

    wavelengths: List[int] = []
    full_c_ext: List[float] = []
    full_c_abs: List[float] = []
    full_c_sca: List[float] = []
    dipole_c_ext: List[float] = []

    peak_wl_full = 0
    max_c_ext_full = -1.0

    for wl_nm, (eps1, eps2) in optical_dict.items():
        # Complex refractive index: n_p = sqrt(eps1 + i*eps2)
        eps_particle = complex(eps1, eps2)
        n_particle = cmath.sqrt(eps_particle)
        m_rel = n_particle / medium_refractive_index

        # Size parameter in medium: x = 2*pi*n_d*r / lambda
        x = (2.0 * math.pi * medium_refractive_index * r_nm) / wl_nm

        # 1. Full Mie Theory
        q_ext, q_sca, q_abs = compute_mie_coefficients(m_rel, x)
        c_ext_full = q_ext * geom_area_nm2
        c_sca_full = q_sca * geom_area_nm2
        c_abs_full = q_abs * geom_area_nm2

        # 2. Electric Dipole Approximation:
        # C_ext_dip = 4*pi*k*r^3 * Im((eps_p - eps_d) / (eps_p + 2*eps_d))
        eps_d = medium_refractive_index ** 2
        frac_dip = (eps_particle - eps_d) / (eps_particle + 2.0 * eps_d)
        k_medium_nm_inv = (2.0 * math.pi * medium_refractive_index) / wl_nm
        c_ext_dip = 4.0 * math.pi * k_medium_nm_inv * (r_nm ** 3) * frac_dip.imag

        wavelengths.append(wl_nm)
        full_c_ext.append(round(c_ext_full, 2))
        full_c_abs.append(round(c_abs_full, 2))
        full_c_sca.append(round(c_sca_full, 2))
        dipole_c_ext.append(round(max(0.0, c_ext_dip), 2))

        if c_ext_full > max_c_ext_full:
            max_c_ext_full = c_ext_full
            peak_wl_full = wl_nm

    # Compute deviation between Dipole and Full Mie at resonance peak
    peak_idx = wavelengths.index(peak_wl_full)
    dip_at_peak = dipole_c_ext[peak_idx]
    mie_at_peak = full_c_ext[peak_idx]
    rel_diff_pct = abs(mie_at_peak - dip_at_peak) / max(1e-4, mie_at_peak) * 100.0

    return {
        "material": "Silver (Ag)" if "silver" in material.lower() or "ag" in material.lower() else "Gold (Au)",
        "diameter_nm": diameter_nm,
        "medium_refractive_index": medium_refractive_index,
        "peak_resonance_wavelength_nm": peak_wl_full,
        "max_extinction_cross_section_nm2": round(max_c_ext_full, 2),
        "geometric_cross_section_nm2": round(geom_area_nm2, 2),
        "dipole_approximation_deviation_pct": round(rel_diff_pct, 1),
        "size_parameter_x_at_peak": round((2.0 * math.pi * medium_refractive_index * r_nm) / peak_wl_full, 3),
        "spectra": {
            "wavelengths_nm": wavelengths,
            "full_mie_extinction_nm2": full_c_ext,
            "full_mie_absorption_nm2": full_c_abs,
            "full_mie_scattering_nm2": full_c_sca,
            "dipole_approximation_extinction_nm2": dipole_c_ext
        },
        "scientific_assessment": (
            "Small particle domain (d < 25 nm): Dipole approximation closely mirrors full Mie series."
            if diameter_nm <= 25 else
            "Retardation regime (d >= 30 nm): Full Mie solution accounts for quadrupolar modes and dynamic depolarisation that the small-particle dipole equation underestimates."
        )
    }
