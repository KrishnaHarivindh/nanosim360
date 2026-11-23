import React, { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export const NanoSize: React.FC = () => {
  const [distType, setDistType] = useState<'lognormal' | 'gaussian'>('lognormal');
  const [meanDiameter, setMeanDiameter] = useState<number>(20.0);
  const [stdDev, setStdDev] = useState<number>(3.5);
  const [density, setDensity] = useState<number>(19.32);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nanosize/distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distribution_type: distType,
          mean_diameter_nm: meanDiameter,
          std_dev_nm: stdDev,
          sample_size: 5000,
          material_density_g_cm3: density,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          <span>NanoSize: Particle Population Statistics & Monte Carlo Uncertainty</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Simulate polydisperse ensembles (N=5000), calculate number-weighted vs volume-weighted (D4,3) means, and propagate uncertainty to Specific Surface Area (SSA) via Monte Carlo bootstrapping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-slate-200 text-sm">Distribution Parameters</h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Distribution Model</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setDistType('lognormal')}
                className={`py-2 rounded border font-medium ${
                  distType === 'lognormal' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'
                }`}
              >
                Log-Normal (Colloidal)
              </button>
              <button
                onClick={() => setDistType('gaussian')}
                className={`py-2 rounded border font-medium ${
                  distType === 'gaussian' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'
                }`}
              >
                Gaussian (Monodisperse)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Mean Diameter (nm)</label>
              <input
                type="number"
                step="0.5"
                value={meanDiameter}
                onChange={e => setMeanDiameter(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Standard Deviation (nm)</label>
              <input
                type="number"
                step="0.2"
                value={stdDev}
                onChange={e => setStdDev(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Material Density (g/cm³)</label>
            <input
              type="number"
              step="0.1"
              value={density}
              onChange={e => setDensity(parseFloat(e.target.value) || 1.0)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-lg shadow-lg text-sm"
          >
            {loading ? 'Sampling Monte Carlo Ensemble...' : 'Run Population Simulation'}
          </button>
        </div>

        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold text-slate-200 text-sm mb-4">Statistical Means & Polydisperse SSA</h3>

          {result ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Number-Weighted Mean (D_N)</span>
                  <span className="text-2xl font-bold text-white">
                    {result.number_weighted.mean_diameter_nm} nm
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Median: {result.number_weighted.median_diameter_nm} nm &bull; CV: {result.number_weighted.coefficient_of_variation_pct}%
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Volume-Weighted Mean (D4,3)</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {result.volume_weighted.d4_3_mean_diameter_nm} nm
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Sauter D3,2: {result.volume_weighted.volume_surface_d3_2_sauter_nm} nm
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Polydisperse Specific Surface Area</span>
                  <span className="text-emerald-400 font-bold font-mono text-base">
                    {result.polydisperse_specific_surface_area.value_m2_g} m²/g
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Ideal Monodisperse Baseline: <span className="text-slate-300 font-mono">{result.polydisperse_specific_surface_area.monodisperse_ideal_baseline_m2_g} m²/g</span> &bull; Ratio: <span className="text-cyan-300 font-mono">{result.polydisperse_specific_surface_area.polydispersity_effect_ratio}x</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Monte Carlo 95% Confidence Interval: <span className="text-amber-400 font-mono">[{result.polydisperse_specific_surface_area.monte_carlo_95_ci_m2_g[0]}, {result.polydisperse_specific_surface_area.monte_carlo_95_ci_m2_g[1]}] m²/g</span>
                </div>
              </div>

              {/* Size Distribution Histogram */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">Simulated Size Bins Distribution</span>
                <div className="space-y-1.5 text-xs font-mono">
                  {result.histogram.map((bin: any) => (
                    <div key={bin.bin_range} className="flex items-center space-x-3">
                      <span className="w-28 text-slate-400">{bin.bin_range}</span>
                      <div className="flex-1 bg-slate-900 h-2 rounded overflow-hidden">
                        <div className="bg-cyan-400 h-full" style={{ width: `${bin.percentage * 2.5}%` }}></div>
                      </div>
                      <span className="w-16 text-right text-slate-300">{bin.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <TrendingUp className="w-10 h-10 mb-2 opacity-40 text-cyan-400" />
              <p className="text-sm">Configure parameters and click simulate to analyze polydisperse population.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
