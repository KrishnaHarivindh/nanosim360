"""
NanoStructure Studio: Atomic Coordinate Generation & Defect Engineering Engine.
Generates genuine 3D atomic coordinates (Cartesian Angstroms) for:
- Graphene Supercells with optional substitutional dopants (e.g., Nitrogen/Boron) & vacancies.
- An ideal regular truncated-icosahedron C60 cage (not geometry-relaxed).
- Export to standard .XYZ chemical format for VESTA, ASE, or PyMOL.
"""

import math
from typing import Dict, Any, List, Optional

def generate_graphene_coordinates(
    nx: int = 4,
    ny: int = 4,
    dopant_element: Optional[str] = None,
    dopant_ratio: float = 0.05,
    vacancy_count: int = 0
) -> Dict[str, Any]:
    """
    Generates exact Cartesian coordinates (x, y, z in Angstroms) for a graphene monolayer.
    C-C bond length: a_cc = 1.42 Å.
    Lattice basis vectors:
    a1 = (sqrt(3)*a_cc, 0)
    a2 = (sqrt(3)*a_cc/2, 3*a_cc/2)
    Basis atoms per unit cell:
    atom1 = (0, 0, 0)
    atom2 = (0, a_cc, 0)
    """
    if isinstance(nx, bool) or not isinstance(nx, int) or not 1 <= nx <= 100:
        raise ValueError("Graphene dimension nx must be an integer from 1 to 100.")
    if isinstance(ny, bool) or not isinstance(ny, int) or not 1 <= ny <= 100:
        raise ValueError("Graphene dimension ny must be an integer from 1 to 100.")
    if isinstance(vacancy_count, bool) or not isinstance(vacancy_count, int):
        raise ValueError("Vacancy count must be a non-negative integer.")
    if not math.isfinite(dopant_ratio) or not 0.0 <= dopant_ratio <= 1.0:
        raise ValueError("Dopant ratio must be between 0 and 1.")
    if dopant_element is not None and dopant_element not in {"N", "B"}:
        raise ValueError("Supported substitutional dopants are N and B.")

    a_cc = 1.421 # Angstroms
    sqrt3 = math.sqrt(3.0)
    
    atoms: List[Dict[str, Any]] = []
    atom_id = 1

    for i in range(nx):
        for j in range(ny):
            # Origin of unit cell (i, j)
            x_base = i * (sqrt3 * a_cc) + j * (sqrt3 * a_cc / 2.0)
            y_base = j * (1.5 * a_cc)

            # Two basis atoms
            # Atom 1
            atoms.append({
                "id": atom_id,
                "element": "C",
                "x": round(x_base, 4),
                "y": round(y_base, 4),
                "z": 0.0
            })
            atom_id += 1

            # Atom 2
            atoms.append({
                "id": atom_id,
                "element": "C",
                "x": round(x_base, 4),
                "y": round(y_base + a_cc, 4),
                "z": 0.0
            })
            atom_id += 1

    # Apply vacancies
    if not 0 <= vacancy_count < len(atoms):
        raise ValueError(f"Vacancy count must be from 0 to {len(atoms) - 1} for this supercell.")
    if vacancy_count:
        import random
        rng = random.Random(42)
        vac_indices = set(rng.sample(range(len(atoms)), vacancy_count))
        atoms = [a for idx, a in enumerate(atoms) if idx not in vac_indices]

    # Apply substitutional doping
    doped_count = 0
    if dopant_element and dopant_ratio > 0:
        import random
        rng = random.Random(42)
        num_to_dope = int(round(len(atoms) * dopant_ratio))
        doped_indices = set(rng.sample(range(len(atoms)), min(len(atoms), num_to_dope)))
        for idx in doped_indices:
            atoms[idx]["element"] = dopant_element
            doped_count += 1

    # Generate XYZ file format string
    xyz_lines = [str(len(atoms)), f"NanoSim 360 Generated Graphene Supercell {nx}x{ny}"]
    for a in atoms:
        xyz_lines.append(f"{a['element']}  {a['x']:>10.4f}  {a['y']:>10.4f}  {a['z']:>10.4f}")
    xyz_content = "\n".join(xyz_lines)

    return {
        "structure": "Graphene Supercell",
        "unit_cells_x": nx,
        "unit_cells_y": ny,
        "total_atoms": len(atoms),
        "dopant_element": dopant_element,
        "doped_atoms_count": doped_count,
        "doping_concentration_pct": round((doped_count / len(atoms)) * 100.0, 2) if atoms else 0.0,
        "vacancies_introduced": vacancy_count,
        "lattice_span_angstroms": {
            "width_x": round(nx * sqrt3 * a_cc, 2),
            "height_y": round(ny * 1.5 * a_cc, 2)
        },
        "xyz_format": xyz_content,
        "sample_atoms": atoms[:30] # Sample preview
    }


def generate_c60_fullerene() -> Dict[str, Any]:
    """
    Generates idealized Buckminsterfullerene (C60) coordinates from a
    regular truncated icosahedron. Bond lengths are equalized; this is not
    an experimentally relaxed molecular geometry.
    Radius: R ≈ 3.55 Å.
    """
    phi = (1.0 + math.sqrt(5.0)) / 2.0
    ico = [
        (-1, phi, 0), (1, phi, 0), (-1, -phi, 0), (1, -phi, 0),
        (0, -1, phi), (0, 1, phi), (0, -1, -phi), (0, 1, -phi),
        (phi, 0, -1), (phi, 0, 1), (-phi, 0, -1), (-phi, 0, 1),
    ]
    edge_length_sq = min(
        sum((p[k] - q[k]) ** 2 for k in range(3))
        for i, p in enumerate(ico) for q in ico[i + 1:]
    )
    neighbors = [
        [j for j, q in enumerate(ico) if i != j and abs(sum((p[k] - q[k]) ** 2 for k in range(3)) - edge_length_sq) < 1e-9]
        for i, p in enumerate(ico)
    ]
    truncated = []
    for i, p in enumerate(ico):
        for j in neighbors[i]:
            q = ico[j]
            truncated.append(tuple((2.0 * p[k] + q[k]) / 3.0 for k in range(3)))

    r_c60 = 3.55
    raw_radius = max(math.sqrt(sum(v * v for v in point)) for point in truncated)
    scale = r_c60 / raw_radius
    atom_list = [
        {"id": i + 1, "element": "C", "x": round(point[0] * scale, 4),
         "y": round(point[1] * scale, 4), "z": round(point[2] * scale, 4)}
        for i, point in enumerate(truncated)
    ]

    xyz_lines = ["60", "Buckminsterfullerene C60 Cluster NanoSim 360"]
    for a in atom_list:
        xyz_lines.append(f"C  {a['x']:>10.4f}  {a['y']:>10.4f}  {a['z']:>10.4f}")

    return {
        "structure": "Buckminsterfullerene (C60)",
        "symmetry_point_group": "Ih (Icosahedral)",
        "total_atoms": 60,
        "mean_cage_radius_angstrom": r_c60,
        "xyz_format": "\n".join(xyz_lines),
        "atoms": atom_list
    }
