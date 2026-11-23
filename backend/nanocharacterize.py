"""
NanoCharacterize Engine:
Experimental characterization laboratory supporting:
1. Micrograph (TEM/SEM) digital particle segmentation & size distribution statistics.
2. X-ray Diffraction (XRD) Scherrer coherent crystallite size estimation.
3. Optical UV-Vis absorbance spectra baseline & peak analysis.
"""

import io
import math
import numpy as np
from typing import Dict, Any, List
from PIL import Image

def analyze_micrograph_particles(
    image_bytes: bytes,
    nm_per_pixel: float = 0.5,
    threshold: int = 120
) -> Dict[str, Any]:
    """
    Analyzes an uploaded TEM/SEM micrograph:
    - Performs grayscale conversion and intensity thresholding.
    - Measures projected particle cross-sections, equivalent circular diameter (ECD),
      mean, standard deviation, and Feret-like minimum/maximum spans.
    """
    if not math.isfinite(nm_per_pixel) or nm_per_pixel <= 0:
        raise ValueError("Spatial calibration (nm per pixel) must be finite and strictly positive.")

    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    arr = np.array(img)

    # Simple connected components / particle detection via local dark/bright contrast
    # Nanoparticles typically appear as dark spots (low intensity) on bright carbon grids in bright-field TEM
    binary = arr < threshold
    
    # Label connected components manually or via simple bounding-box clustering
    from scipy.ndimage import label, find_objects
    labeled, num_features = label(binary)
    slices = find_objects(labeled)

    diameters_nm: List[float] = []
    aspect_ratios: List[float] = []

    for s in slices:
        sub = labeled[s]
        pixel_count = np.sum(sub > 0)
        # Filter noise artifacts (< 9 pixels) or full-image borders
        if pixel_count < 9 or pixel_count > (arr.size * 0.5):
            continue
        
        # Equivalent Circular Diameter (Area = pi * r^2 -> d = 2 * sqrt(Area / pi))
        area_nm2 = pixel_count * (nm_per_pixel ** 2)
        ecd_nm = 2.0 * math.sqrt(area_nm2 / math.pi)
        
        # Bounding aspect ratio
        h_px = s[0].stop - s[0].start
        w_px = s[1].stop - s[1].start
        aspect = max(h_px, w_px) / max(1, min(h_px, w_px))

        diameters_nm.append(round(ecd_nm, 2))
        aspect_ratios.append(round(aspect, 2))

    if not diameters_nm:
        raise ValueError("No particles were detected. Check the image contrast and threshold, then try another micrograph.")

    arr_d = np.array(diameters_nm)
    mean_d = float(np.mean(arr_d))
    std_d = float(np.std(arr_d))
    median_d = float(np.median(arr_d))

    # Construct histogram distribution bins (5 bins)
    hist, bin_edges = np.histogram(arr_d, bins=min(6, len(arr_d)))
    bins_data = [
        {"bin_range": f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f} nm", "count": int(hist[i])}
        for i in range(len(hist))
    ]

    return {
        "particle_count": len(diameters_nm),
        "mean_diameter_nm": round(mean_d, 2),
        "median_diameter_nm": round(median_d, 2),
        "std_deviation_nm": round(std_d, 2),
        "min_diameter_nm": float(np.min(arr_d)),
        "max_diameter_nm": float(np.max(arr_d)),
        "mean_aspect_ratio": round(float(np.mean(aspect_ratios)), 2),
        "calibration_nm_per_pixel": nm_per_pixel,
        "size_distribution_histogram": bins_data,
        "particle_measurements_nm": diameters_nm[:50], # Sample for display
        "scientific_note": "Equivalent circular diameter (ECD) derived from 2D projected transmission cross-section. Assumes non-agglomerated distinct particles."
    }


def calculate_xrd_scherrer(
    two_theta_deg: float,
    fwhm_deg: float,
    xray_wavelength_nm: float = 0.15406, # Cu K-alpha
    shape_factor_k: float = 0.94
) -> Dict[str, Any]:
    """
    Computes coherent crystallite size using the Scherrer Equation:
    D = (K * lambda) / (beta * cos(theta))
    where:
    - K: Scherrer shape constant (typically ~0.9 - 0.94)
    - lambda: X-ray source wavelength (Cu K_alpha = 0.15406 nm or 1.5406 Å)
    - beta: Full width at half maximum (FWHM) in RADIANS
    - theta: Bragg angle in RADIANS (2*theta / 2)
    """
    if two_theta_deg <= 0 or two_theta_deg >= 180:
        raise ValueError("2-Theta angle must be between 0° and 180°.")
    if fwhm_deg <= 0:
        raise ValueError("Peak broadening (FWHM) must be strictly positive.")

    theta_rad = math.radians(two_theta_deg / 2.0)
    beta_rad = math.radians(fwhm_deg)

    crystallite_size_nm = (shape_factor_k * xray_wavelength_nm) / (beta_rad * math.cos(theta_rad))

    return {
        "two_theta_deg": two_theta_deg,
        "bragg_angle_theta_deg": two_theta_deg / 2.0,
        "fwhm_deg": fwhm_deg,
        "fwhm_rad": beta_rad,
        "xray_wavelength_nm": xray_wavelength_nm,
        "xray_source": "Cu K-α (0.15406 nm)",
        "shape_factor_k": shape_factor_k,
        "crystallite_size_nm": round(crystallite_size_nm, 2),
        "formula": "D = (K * λ) / (β * cos(θ))",
        "derivation": f"D = ({shape_factor_k} * {xray_wavelength_nm} nm) / ({beta_rad:.4f} rad * cos({two_theta_deg/2.0:.2f}°)) = {crystallite_size_nm:.2f} nm",
        "distinction_note": "Crystallite size (coherent diffracting domain) is distinct from particle size measured via TEM/DLS; a single physical particle often consists of multiple polycrystalline domains."
    }
