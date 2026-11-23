import React, { useState } from 'react';
import { Microscope, Activity, Info } from 'lucide-react';

export const NanoCharacterize: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'xrd' | 'tem'>('xrd');

  // XRD state
  const [twoTheta, setTwoTheta] = useState<number>(38.2); // Typical Au (111) peak
  const [fwhm, setFwhm] = useState<number>(0.85);
  const [xrdResult, setXrdResult] = useState<any>(null);
  const [loadingXrd, setLoadingXrd] = useState<boolean>(false);

  // TEM state
  const [nmPerPixel, setNmPerPixel] = useState<number>(0.5);
  const [temResult, setTemResult] = useState<any>(null);
  const [loadingTem, setLoadingTem] = useState<boolean>(false);
  const [micrograph, setMicrograph] = useState<File | null>(null);
  const [temError, setTemError] = useState<string | null>(null);

  const handleCalculateXRD = async () => {
    setLoadingXrd(true);
    try {
      const res = await fetch('/api/nanocharacterize/xrd-scherrer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          two_theta_deg: twoTheta,
          fwhm_deg: fwhm,
          xray_wavelength_nm: 0.15406,
          shape_factor_k: 0.94,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setXrdResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingXrd(false);
    }
  };

  const handleSimulateTEM = async () => {
    if (!micrograph) {
      setTemError('Choose a TEM or SEM image to analyze.');
      return;
    }
    setLoadingTem(true);
    setTemError(null);
    try {
      const formData = new FormData();
      formData.append('file', micrograph);
      const response = await fetch(`/api/nanocharacterize/tem-micrograph?nm_per_pixel=${encodeURIComponent(nmPerPixel)}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Micrograph analysis failed.');
      setTemResult(data);
    } catch (error) {
      setTemResult(null);
      setTemError(error instanceof Error ? error.message : 'Micrograph analysis failed.');
    } finally {
      setLoadingTem(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Microscope className="w-7 h-7 text-emerald-400" />
          <span>NanoCharacterize: Experimental Data Analysis Laboratory</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Bridge the gap between theoretical models and real-world experiments via XRD Scherrer crystallite sizing and TEM micrograph particle-size distributions.
        </p>
      </div>

      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('xrd')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'xrd' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>X-Ray Diffraction (XRD) Crystallite Sizing</span>
        </button>
        <button
          onClick={() => setActiveTab('tem')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'tem' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Microscope className="w-4 h-4" />
          <span>TEM Micrograph Particle Size Analyzer</span>
        </button>
      </div>

      {activeTab === 'xrd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="font-semibold text-slate-200 text-sm">Diffraction Peak Parameters</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Peak Position (2θ in degrees)</label>
              <input
                type="number"
                step="0.1"
                value={twoTheta}
                onChange={e => setTwoTheta(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200"
              />
              <span className="text-[11px] text-slate-500 block mt-1">E.g., Au (111) peak ~ 38.2°, Ag (111) ~ 38.1°</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Peak Broadening (FWHM β in degrees)</label>
              <input
                type="number"
                step="0.05"
                value={fwhm}
                onChange={e => setFwhm(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Full Width at Half Maximum</span>
            </div>

            <div className="p-3 bg-slate-950 rounded text-xs text-slate-400 space-y-1">
              <div>&bull; X-ray source: <span className="text-cyan-300 font-mono">Cu K-α (λ = 0.15406 nm)</span></div>
              <div>&bull; Scherrer shape constant: <span className="text-cyan-300 font-mono">K = 0.94</span></div>
            </div>

            <button
              onClick={handleCalculateXRD}
              disabled={loadingXrd}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg shadow-lg text-sm"
            >
              {loadingXrd ? 'Computing Crystallite Size...' : 'Calculate Scherrer Crystallite Size'}
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-slate-200 text-sm mb-4">Crystallite Size & Derivation</h3>

            {xrdResult ? (
              <div className="space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Coherent Crystallite Domain Size</span>
                  <span className="text-3xl font-bold text-emerald-400 font-mono">
                    {xrdResult.crystallite_size_nm} nm
                  </span>
                  <span className="text-xs text-slate-500 block mt-1 font-mono">
                    {xrdResult.formula}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
                  <span className="text-cyan-400 font-semibold block mb-1">Analytical Step:</span>
                  <div className="text-slate-300">&bull; {xrdResult.derivation}</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>{xrdResult.distinction_note}</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                <Activity className="w-10 h-10 mb-2 opacity-40 text-emerald-400" />
                <p className="text-sm">Enter 2θ and FWHM to estimate crystallite domain size.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tem' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="font-semibold text-slate-200 text-sm">Micrograph Calibration & Sample Input</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Scale Calibration (nm per pixel)</label>
              <input
                type="number"
                step="0.05"
                value={nmPerPixel}
                onChange={e => setNmPerPixel(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200"
              />
            </div>

            <div>
              <label htmlFor="tem-micrograph" className="block text-xs font-medium text-slate-400 mb-1">TEM or SEM Micrograph</label>
              <input
                id="tem-micrograph"
                type="file"
                accept="image/*"
                onChange={e => { setMicrograph(e.target.files?.[0] ?? null); setTemError(null); setTemResult(null); }}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-800 file:px-2 file:py-1 file:text-slate-200"
              />
            </div>

            <button
              onClick={handleSimulateTEM}
              disabled={loadingTem || !micrograph}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg shadow-lg text-sm"
            >
              {loadingTem ? 'Detecting Nanoparticles...' : 'Run Micrograph Particle Detection'}
            </button>
            {temError && <p role="alert" className="text-xs text-rose-300">{temError}</p>}
          </div>

          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-slate-200 text-sm mb-4">Particle Size Statistics & Histogram</h3>

            {temResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Total Count</span>
                    <span className="text-xl font-bold text-white">{temResult.particle_count} particles</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Mean Diameter</span>
                    <span className="text-xl font-bold text-cyan-400">{temResult.mean_diameter_nm} nm</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Std. Deviation</span>
                    <span className="text-xl font-bold text-slate-300">±{temResult.std_deviation_nm} nm</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Particle Size Distribution Histogram</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    {temResult.size_distribution_histogram.map((bin: any) => (
                      <div key={bin.bin_range} className="flex items-center space-x-3">
                        <span className="w-28 text-slate-400">{bin.bin_range}</span>
                        <div className="flex-1 bg-slate-900 h-2 rounded overflow-hidden">
                          <div className="bg-emerald-400 h-full" style={{ width: `${(bin.count / 18) * 100}%` }}></div>
                        </div>
                        <span className="w-12 text-right text-slate-300">{bin.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                <Microscope className="w-10 h-10 mb-2 opacity-40 text-emerald-400" />
                <p className="text-sm">Click detect to generate size distribution statistics.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
