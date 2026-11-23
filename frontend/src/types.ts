export interface Material {
  id: number;
  slug: string;
  name: string;
  formula: string;
  category: string;
  dimensionality: string;
  density_g_cm3: number;
  structure_type: string;
  description: string;
  electrical_properties: string;
  optical_properties: string;
  mechanical_properties: string;
  applications: string[];
  advantages: string[];
  limitations: string[];
  references: {
    title: string;
    authors: string;
    year: number;
    doi: string;
  }[];
}

export interface SphereCalcResult {
  inputs: {
    diameter: number;
    diameter_unit: string;
    density: number;
    density_unit: string;
  };
  radius: {
    value_nm: number;
    value_m: number;
    formula: string;
    derivation_step: string;
  };
  volume: {
    value_nm3: number;
    value_m3: number;
    formula: string;
    derivation_step: string;
  };
  surface_area: {
    value_nm2: number;
    value_m2: number;
    formula: string;
    derivation_step: string;
  };
  surface_area_to_volume_ratio: {
    value_nm_inv: number;
    value_m_inv: number;
    unit: string;
    formula: string;
    derivation_step: string;
  };
  specific_surface_area: {
    value_m2_g: number;
    value_m2_kg: number;
    unit: string;
    formula: string;
    derivation_step: string;
  };
  particle_mass: {
    value_g: number;
    value_kg: number;
    formula: string;
    derivation_step: string;
  };
  assumptions: string[];
}

export interface CNTChiralResult {
  chiral_indices: { n: number; m: number };
  diameter_nm: number;
  radius_nm: number;
  chiral_vector_length_nm: number;
  chiral_angle_deg: number;
  classification: string;
  electronic_character: string;
  is_metallic: boolean;
  is_true_metallic_armchair: boolean;
  estimated_bandgap_ev: number;
  length_nm: number;
  approx_carbon_atoms: number;
  formulas: {
    diameter: string;
    chiral_angle: string;
    metallicity_condition: string;
  };
  derivation_steps: string[];
  scientific_caveats: string;
}

export interface MLPredictionResult {
  model_name: string;
  target_property: string;
  predicted_effective_bandgap_ev: number;
  confinement_energy_shift_ev: number;
  estimated_emission_wavelength_nm: number;
  uncertainty_ev: number;
  model_metrics: {
    MAE_eV: number;
    RMSE_eV: number;
    R2_score: number;
  };
  domain_warnings: string[];
  scientific_disclaimer: string;
}

export interface DashboardSummary {
  total_materials: number;
  categories: string[];
  total_calculations_logged: number;
  total_predictions_logged: number;
  recent_calculations: any[];
  recent_predictions: any[];
  featured_material: string;
  ml_model_status: string;
}
