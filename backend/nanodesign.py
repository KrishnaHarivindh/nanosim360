"""
NanoDesign Engine: Intelligent Multi-Criteria Decision Analysis (MCDA)
and Material Candidate Recommender for Nanotechnology Applications.
Uses Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS)
and weighted vector utility scoring to rank materials transparently.
"""

import math
from typing import Dict, Any, List

# Criteria benchmarks for candidate materials
# Format: [Conductivity_score (1-10), Surface_Area_score (1-10), Biocompatibility (1-10), Cost_Efficiency (1-10)]
MATERIAL_FEATURE_MATRIX = [
    {
        "name": "Titanium Dioxide (TiO2)",
        "slug": "tio2",
        "scores": {"photocatalysis": 9.5, "surface_area": 8.0, "biocompatibility": 8.5, "cost_efficiency": 9.0, "electrical": 4.0, "optical_lspr": 1.0},
        "description": "Premier wide-bandgap photocatalyst with high chemical stability and cost efficiency."
    },
    {
        "name": "Zinc Oxide (ZnO)",
        "slug": "zno",
        "scores": {"photocatalysis": 8.5, "surface_area": 8.0, "biocompatibility": 7.0, "cost_efficiency": 8.5, "electrical": 6.5, "optical_lspr": 2.0},
        "description": "High exciton binding energy (60 meV) piezoelectric semiconductor with broad UV absorption."
    },
    {
        "name": "Gold Nanoparticles (AuNPs)",
        "slug": "gold-nanoparticles",
        "scores": {"photocatalysis": 4.0, "surface_area": 7.5, "biocompatibility": 9.8, "cost_efficiency": 2.0, "electrical": 9.5, "optical_lspr": 10.0},
        "description": "High biocompatibility and intense LSPR resonance, ideal for biosensing and medical photothermal therapy."
    },
    {
        "name": "Graphene Monolayer",
        "slug": "graphene",
        "scores": {"photocatalysis": 5.0, "surface_area": 9.8, "biocompatibility": 6.0, "cost_efficiency": 5.5, "electrical": 10.0, "optical_lspr": 2.0},
        "description": "Exceptional electrical mobility (>200,000 cm²/V·s) and theoretical surface area (2630 m²/g) for electrode supercapacitors."
    },
    {
        "name": "Carbon Nanotubes (CNTs)",
        "slug": "cnt",
        "scores": {"photocatalysis": 4.5, "surface_area": 8.8, "biocompatibility": 4.5, "cost_efficiency": 6.0, "electrical": 9.2, "optical_lspr": 2.0},
        "description": "High aspect-ratio conductive network additive for aerospace composites and energy storage cathodes."
    },
    {
        "name": "Silver Nanoparticles (AgNPs)",
        "slug": "silver-nanoparticles",
        "scores": {"photocatalysis": 4.0, "surface_area": 7.5, "biocompatibility": 6.5, "cost_efficiency": 7.0, "electrical": 9.8, "optical_lspr": 9.5},
        "description": "Potent antimicrobial surface activity and intense localized plasmonic extinction in near-UV/blue."
    }
]

def recommend_nanomaterial(
    target_application: str = "photocatalysis",
    importance_weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Ranks candidates with TOPSIS using curated heuristic 1-10 ratings and weights.
    The closeness values are calculated from the rating matrix; the underlying
    ratings are illustrative inputs, not measured material properties.
    """
    # Standardized criteria weights
    default_criteria = {
        "photocatalysis": {
            "photocatalysis": 0.40,
            "surface_area": 0.25,
            "biocompatibility": 0.15,
            "cost_efficiency": 0.20
        },
        "biomedical_diagnostics": {
            "biocompatibility": 0.45,
            "optical_lspr": 0.30,
            "surface_area": 0.15,
            "cost_efficiency": 0.10
        },
        "energy_storage": {
            "electrical": 0.45,
            "surface_area": 0.35,
            "cost_efficiency": 0.20
        }
    }

    weights = importance_weights or default_criteria.get(target_application, {"surface_area": 0.5, "cost_efficiency": 0.5})

    # Perform TOPSIS normalization across candidate alternatives
    # S_ij = w_j * (Score_ij / sqrt(sum(Score_j^2)))
    candidates: List[Dict[str, Any]] = []

    criteria_keys = list(weights.keys())
    
    # Compute vector norms
    norms = {}
    for crit in criteria_keys:
        sq_sum = sum(mat["scores"].get(crit, 4.0)**2 for mat in MATERIAL_FEATURE_MATRIX)
        norms[crit] = math.sqrt(sq_sum) if sq_sum > 0 else 1.0

    # Determine Ideal (A+) and Anti-Ideal (A-) Solutions
    ideal_best = {crit: 0.0 for crit in criteria_keys}
    ideal_worst = {crit: 1e9 for crit in criteria_keys}

    weighted_matrix = []
    for mat in MATERIAL_FEATURE_MATRIX:
        row = {}
        for crit in criteria_keys:
            raw = mat["scores"].get(crit, 4.0)
            normed = (raw / norms[crit]) * weights[crit]
            row[crit] = normed
            if normed > ideal_best[crit]:
                ideal_best[crit] = normed
            if normed < ideal_worst[crit]:
                ideal_worst[crit] = normed
        weighted_matrix.append((mat, row))

    # Compute Euclidean distance to ideal (D+) and anti-ideal (D-)
    # Relative closeness C_i = D- / (D+ + D-)
    for mat, row in weighted_matrix:
        d_plus = math.sqrt(sum((row[crit] - ideal_best[crit])**2 for crit in criteria_keys))
        d_minus = math.sqrt(sum((row[crit] - ideal_worst[crit])**2 for crit in criteria_keys))
        
        topsis_closeness = d_minus / (d_plus + d_minus) if (d_plus + d_minus) > 0 else 0.5
        utility_score = round(topsis_closeness * 100.0, 1)

        # Scientific explanation of strengths & trade-offs
        strengths = [k for k, v in mat["scores"].items() if v >= 8.5]
        weaknesses = [k for k, v in mat["scores"].items() if v <= 5.0]

        candidates.append({
            "name": mat["name"],
            "slug": mat["slug"],
            "utility_score": utility_score,
            "topsis_closeness": round(topsis_closeness, 4),
            "description": mat["description"],
            "key_advantages": strengths,
            "tradeoffs": weaknesses,
            "criteria_scores": mat["scores"]
        })

    candidates.sort(key=lambda x: x["utility_score"], reverse=True)

    return {
        "target_application": target_application.replace("_", " ").title(),
        "applied_criteria_weights": weights,
        "algorithm": "Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)",
        "top_recommended_candidate": candidates[0]["name"],
        "top_utility_score": candidates[0]["utility_score"],
        "rankings": candidates,
        "methodology_note": "Rankings and closeness scores are calculated with TOPSIS from normalized criteria ratings and application weights. The 1-10 material ratings are curated heuristic inputs, not measured properties or experimentally fitted values."
    }
