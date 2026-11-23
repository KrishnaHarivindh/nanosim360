import React, { useState } from 'react';
import { Material, SphereCalcResult, CNTChiralResult } from '../types';
import { Calculator, Atom, FileText } from 'lucide-react';

interface Props {
  materials: Material[];
}

export const PropertyCalculator: React.FC<Props> = ({ materials }) => {
  const [activeTab, setActiveTab] = useState<'sphere' | 'cnt'>('sphere');

  // Sphere Calculator State
  const [selectedMaterial, setSelectedMaterial] = useState<string>('gold-nanoparticles');
  const [diameter, setDiameter] = useState<number>(20.0);
  const [diameterUnit, setDiameterUnit] = useState<string>('nm');
  const [density, setDensity] = useState<number>(19.32);
  const [densityUnit, setDensityUnit] = useState<string>('g/cm3');
  const [sphereResult, setSphereResult] = useState<SphereCalcResult | null>(null);
  const [loadingSphere, setLoadingSphere] = useState<boolean>(false);

  // CNT Chiral Calculator State
  const [cntN, setCntN] = useState<number>(10);
  const [cntM, setCntM] = useState<number>(10);
  const [cntLength, setCntLength] = useState<number>(5.0);
  const [cntResult, setCntResult] = useState<CNTChiralResult | null>(null);
  const [loadingCnt, setLoadingCnt] = useState<boolean>(false);

  // Handle Material Preset Select
  const handleMaterialSelect = (slug: string) => {
    setSelectedMaterial(slug);
    const mat = materials.find(m => m.slug === slug);
    if (mat && mat.density_g_cm3) {
      setDensity(mat.density_g_cm3);
    }
  };

  // Run Sphere Calculation
  const handleCalculateSphere = async () => {
    setLoadingSphere(true);
    try {
      const res = await fetch('/api/calculations/sphere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_slug: selectedMaterial,
          diameter,
          diameter_unit: diameterUnit,
          density,
          density_unit: densityUnit,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSphereResult(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSphere(false);
    }
  };

  // Run CNT Chiral Calculation
  const handleCalculateCNT = async () => {
    setLoadingCnt(true);
    try {
      const res = await fetch('/api/calculations/cnt-chiral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n: cntN,
          m: cntM,
          length_nm: cntLength,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCntResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCnt(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Calculator className="w-7 h-7 text-cyan-400" />
          <span>Scientific Property & Nanoscale Dimension Calculator</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Rigorous mathematical modeling distinguishing surface-area-to-volume ratio ($SA/V = 6/d$) from specific surface area ($SSA = 6/\rho d$), plus exact CNT chiral vector kinematics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('sphere')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'sphere'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Atom className="w-4 h-4" />
          <span>Nanoparticle & Quantum Dot Calculator</span>
        </button>
        <button
          onClick={() => setActiveTab('cnt')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'cnt'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Carbon Nanotube (CNT) Chiral Kinematics</span>
        </button>
      </div>

      {/* Sphere Calculator View */}
      {activeTab === 'sphere' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-slate-200">Input Parameters</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Material Reference Preset</label>
              <select
                value={selectedMaterial}
                onChange={e => handleMaterialSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {materials.map(m => (
                  <option key={m.slug} value={m.slug}>
                    {m.name} ({m.density_g_cm3 ? `${m.density_g_cm3} g/cm³` : 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Particle Diameter</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={diameter}
                  onChange={e => setDiameter(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Diameter Unit</label>
                <select
                  value={diameterUnit}
                  onChange={e => setDiameterUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="nm">Nanometers (nm)</option>
                  <option value="angstrom">Angstroms (Å)</option>
                  <option value="um">Micrometers (µm)</option>
                  <option value="m">Meters (m)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Density</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={density}
                  onChange={e => setDensity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Density Unit</label>
                <select
                  value={densityUnit}
                  onChange={e => setDensityUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="g/cm3">g/cm³</option>
                  <option value="kg/m3">kg/m³</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculateSphere}
              disabled={loadingSphere}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-lg shadow-lg shadow-cyan-900/30 transition-all text-sm"
            >
              {loadingSphere ? 'Computing Physical Quantities...' : 'Calculate Nanoscale Quantities'}
            </button>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-slate-200 mb-4">Step-by-Step Derivation & Computed Results</h3>

            {sphereResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Surface-Area-to-Volume Ratio (SA/V)</span>
                    <span className="text-xl font-bold text-cyan-400">
                      {sphereResult.surface_area_to_volume_ratio.value_nm_inv.toFixed(4)} nm⁻¹
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-mono">
                      {sphereResult.surface_area_to_volume_ratio.formula}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Specific Surface Area (SSA)</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {sphereResult.specific_surface_area.value_m2_g.toFixed(2)} m²/g
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-mono">
                      {sphereResult.specific_surface_area.formula}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Calculated Particle Volume</span>
                    <span className="text-lg font-bold text-slate-200">
                      {sphereResult.volume.value_nm3.toExponential(3)} nm³
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-mono">
                      {sphereResult.volume.formula}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Single Particle Mass</span>
                    <span className="text-lg font-bold text-slate-200">
                      {sphereResult.particle_mass.value_g.toExponential(3)} g
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-mono">
                      {sphereResult.particle_mass.formula}
                    </span>
                  </div>
                </div>

                {/* Mathematical Derivation Box */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="text-cyan-400 font-semibold mb-2">Step-by-Step Analytical Derivation:</div>
                  <div className="text-slate-300">&bull; {sphereResult.radius.derivation_step}</div>
                  <div className="text-slate-300">&bull; {sphereResult.volume.derivation_step}</div>
                  <div className="text-slate-300">&bull; {sphereResult.surface_area.derivation_step}</div>
                  <div className="text-slate-300">&bull; {sphereResult.surface_area_to_volume_ratio.derivation_step}</div>
                  <div className="text-slate-300">&bull; {sphereResult.specific_surface_area.derivation_step}</div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                <Calculator className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">Enter parameters on the left and click calculate to display derivations.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CNT Chiral Kinematics View */}
      {activeTab === 'cnt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-slate-200">Chiral Vector Indices (n, m)</h3>
            <p className="text-xs text-slate-400">
              Chiral vectors determine roll-up angle $\theta$, exact diameter $d_t$, and whether the nanotube behaves as a metal or semiconductor.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Index n</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={cntN}
                  onChange={e => setCntN(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Index m</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={cntM}
                  onChange={e => setCntM(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nanotube Length (nm)</label>
              <input
                type="number"
                step="0.5"
                min="1.0"
                value={cntLength}
                onChange={e => setCntLength(parseFloat(e.target.value) || 5.0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
              />
            </div>

            <button
              onClick={handleCalculateCNT}
              disabled={loadingCnt}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-lg shadow-lg text-sm"
            >
              {loadingCnt ? 'Deriving Chiral Metrics...' : 'Compute Chiral Structure'}
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-slate-200 mb-4">CNT Geometric & Electronic Classification</h3>

            {cntResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Electronic State</span>
                    <span className={`text-lg font-bold ${cntResult.is_metallic ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {cntResult.electronic_character}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      {cntResult.is_true_metallic_armchair
                        ? 'No bandgap in the ideal armchair model'
                        : `Estimated bandgap Eg ≈ ${cntResult.estimated_bandgap_ev.toFixed(3)} eV`}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Nanotube Classification</span>
                    <span className="text-lg font-bold text-white">
                      {cntResult.classification} Tube
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      Chiral angle θ = {cntResult.chiral_angle_deg.toFixed(2)}°
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Computed Diameter (d_t)</span>
                    <span className="text-lg font-bold text-slate-200">
                      {cntResult.diameter_nm.toFixed(4)} nm
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-mono">
                      Radius r = {cntResult.radius_nm.toFixed(4)} nm
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                    <span className="text-xs text-slate-400 block mb-1">Carbon Atom Count</span>
                    <span className="text-lg font-bold text-slate-200">
                      ~{cntResult.approx_carbon_atoms.toLocaleString()} atoms
                    </span>
                    <span className="text-xs text-slate-500 block mt-1 font-mono">
                      For L = {cntResult.length_nm} nm
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="text-cyan-400 font-semibold mb-2">Kinematic Derivation Steps:</div>
                  {cntResult.derivation_steps.map((step, idx) => (
                    <div key={idx} className="text-slate-300">&bull; {step}</div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">{cntResult.scientific_caveats}</p>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                <Atom className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">Specify indices (n, m) and click compute to derive nanotube structure.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
