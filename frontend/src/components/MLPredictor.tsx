import React, { useState } from 'react';
import { MLPredictionResult } from '../types';
import { BrainCircuit, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const MLPredictor: React.FC = () => {
  const [diameter, setDiameter] = useState<number>(3.5);
  const [bulkBandgap, setBulkBandgap] = useState<number>(1.74); // Default: CdSe
  const [dielectric, setDielectric] = useState<number>(9.3);
  const [meRatio, setMeRatio] = useState<number>(0.13);
  const [mhRatio, setMhRatio] = useState<number>(0.45);
  const [result, setResult] = useState<MLPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Preset Handlers
  const handlePreset = (name: string) => {
    if (name === 'cdse') {
      setBulkBandgap(1.74);
      setDielectric(9.3);
      setMeRatio(0.13);
      setMhRatio(0.45);
    } else if (name === 'zno') {
      setBulkBandgap(3.37);
      setDielectric(10.0);
      setMeRatio(0.24);
      setMhRatio(0.59);
    } else if (name === 'tio2') {
      setBulkBandgap(3.20);
      setDielectric(85.0);
      setMeRatio(0.30);
      setMhRatio(0.80);
    } else if (name === 'si') {
      setBulkBandgap(1.12);
      setDielectric(11.7);
      setMeRatio(0.19);
      setMhRatio(0.49);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          particle_diameter_nm: diameter,
          bulk_bandgap_ev: bulkBandgap,
          dielectric_constant: dielectric,
          electron_effective_mass_ratio: meRatio,
          hole_effective_mass_ratio: mhRatio,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <BrainCircuit className="w-7 h-7 text-indigo-400" />
          <span>AI-Assisted Nanomaterial Property Predictor</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          GradientBoosting surrogate approximating Brus-model quantum-confined bandgaps ($E_g$). This is a model-based estimate, not an independently validated experimental predictor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-200">Nanocrystal Parameters</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
              Scikit-Learn GBR
            </span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Load Benchmark Semiconductor Preset:</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePreset('cdse')}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] rounded text-slate-300"
              >
                CdSe (QD)
              </button>
              <button
                type="button"
                onClick={() => handlePreset('zno')}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] rounded text-slate-300"
              >
                ZnO
              </button>
              <button
                type="button"
                onClick={() => handlePreset('tio2')}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] rounded text-slate-300"
              >
                TiO₂
              </button>
              <button
                type="button"
                onClick={() => handlePreset('si')}
                className="py-1 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] rounded text-slate-300"
              >
                Silicon
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Nanocrystal Core Diameter</span>
              <span className="text-cyan-400 font-mono font-bold">{diameter.toFixed(1)} nm</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="20.0"
              step="0.1"
              value={diameter}
              onChange={e => setDiameter(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>1.5 nm (Strong Confinement)</span>
              <span>20 nm (Bulk-like)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Bulk Bandgap (eV)</label>
              <input
                type="number"
                step="0.01"
                value={bulkBandgap}
                onChange={e => setBulkBandgap(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Dielectric Const (ε_r)</label>
              <input
                type="number"
                step="0.1"
                value={dielectric}
                onChange={e => setDielectric(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Electron Mass (m_e*/m_0)</label>
              <input
                type="number"
                step="0.01"
                value={meRatio}
                onChange={e => setMeRatio(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Hole Mass (m_h*/m_0)</label>
              <input
                type="number"
                step="0.01"
                value={mhRatio}
                onChange={e => setMhRatio(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-950/40 text-sm transition-all"
          >
            {loading ? 'Evaluating ML Model...' : 'Predict Quantum Confined Bandgap'}
          </button>
        </div>

        {/* Prediction Results & Model Evaluation */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-semibold text-slate-200 mb-4">Predicted Property & Model Validation Metrics</h3>

          {result ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Predicted Effective Bandgap</span>
                  <span className="text-2xl font-bold text-indigo-400">
                    {result.predicted_effective_bandgap_ev.toFixed(3)} eV
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Confinement shift: +{result.confinement_energy_shift_ev.toFixed(3)} eV
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Bandgap-Equivalent Photon Wavelength</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {result.estimated_emission_wavelength_nm.toFixed(1)} nm
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Ideal Planck λ = hc / Eg (Does not include Stokes shift/defects)
                  </span>
                </div>
              </div>

              {/* Model Performance Cards */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-300">Trained Model Evaluation (Test Set)</span>
                  <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Synthetic Holdout Metrics</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Mean Absolute Error</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {result.model_metrics.MAE_eV} eV
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Root Mean Squared Error</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {result.model_metrics.RMSE_eV} eV
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">R² Determination</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">
                      {result.model_metrics.R2_score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings and Disclaimers */}
              {result.domain_warnings.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-800/60 p-3 rounded-lg flex items-start space-x-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    {result.domain_warnings.map((w, idx) => (
                      <div key={idx}>{w}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start space-x-2 text-xs text-slate-400">
                <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <p>{result.scientific_disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <BrainCircuit className="w-10 h-10 mb-2 opacity-40 text-indigo-400" />
              <p className="text-sm">Configure parameters and click predict to run ML regression inference.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
