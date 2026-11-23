import React, { useState } from 'react';
import { Sun, Info } from 'lucide-react';

export const NanoOptics: React.FC = () => {
  const [material, setMaterial] = useState<'gold' | 'silver'>('gold');
  const [diameter, setDiameter] = useState<number>(20.0);
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.333);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nanooptics/mie-lspr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material,
          diameter_nm: diameter,
          medium_refractive_index: refractiveIndex,
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
          <Sun className="w-7 h-7 text-amber-400" />
          <span>NanoOptics: Mie Theory Plasmonic LSPR Simulator</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Electromagnetic scattering simulation of Localized Surface Plasmon Resonance (LSPR) based on Johnson & Christy (1972) empirical dielectric constants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-slate-200 text-sm">Simulation Parameters</h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Plasmonic Metal</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setMaterial('gold')}
                className={`py-2 rounded-lg border font-medium ${
                  material === 'gold' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-slate-800 text-slate-400'
                }`}
              >
                Gold (Au)
              </button>
              <button
                onClick={() => setMaterial('silver')}
                className={`py-2 rounded-lg border font-medium ${
                  material === 'silver' ? 'bg-slate-400/20 border-slate-400 text-slate-200' : 'border-slate-800 text-slate-400'
                }`}
              >
                Silver (Ag)
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Particle Diameter</span>
              <span className="text-amber-400 font-mono font-bold">{diameter.toFixed(1)} nm</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={diameter}
              onChange={e => setDiameter(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Surrounding Medium Refractive Index (n)</label>
            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <button
                onClick={() => setRefractiveIndex(1.0)}
                className="py-1 bg-slate-950 border border-slate-800 rounded text-slate-300"
              >
                Air (1.00)
              </button>
              <button
                onClick={() => setRefractiveIndex(1.333)}
                className="py-1 bg-slate-950 border border-slate-800 rounded text-slate-300"
              >
                Water (1.333)
              </button>
              <button
                onClick={() => setRefractiveIndex(1.52)}
                className="py-1 bg-slate-950 border border-slate-800 rounded text-slate-300"
              >
                Glass (1.52)
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={refractiveIndex}
              onChange={e => setRefractiveIndex(parseFloat(e.target.value) || 1.0)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-200"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-lg shadow-lg text-sm"
          >
            {loading ? 'Solving Maxwell Equations...' : 'Calculate Mie Optical Cross-Sections'}
          </button>
        </div>

        {/* Results & Spectra */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold text-slate-200 text-sm mb-4">Extinction Spectrum & Plasmonic Resonance Peak</h3>

          {result ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">LSPR Resonance Peak</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {result.peak_resonance_wavelength_nm} nm
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Full Mie resonance peak
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Peak Extinction Cross-Section</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {result.max_extinction_cross_section_nm2.toLocaleString()} nm²
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    C_ext = C_abs + C_sca
                  </span>
                </div>
              </div>

              {/* Spectral Table */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-2">Simulated Extinction Distribution</span>
                <div className="space-y-1.5 text-xs font-mono">
                  {result.spectra.wavelengths_nm.slice(0, 8).map((wl: number, i: number) => {
                    const c_ext = result.spectra.full_mie_extinction_nm2[i];
                    const percent = Math.min(100, Math.round((c_ext / result.max_extinction_cross_section_nm2) * 100));
                    return (
                      <div key={wl} className="flex items-center space-x-3">
                        <span className="w-14 text-slate-400">{wl} nm</span>
                        <div className="flex-1 bg-slate-900 h-2 rounded overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="w-20 text-right text-slate-300">{c_ext} nm²</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>{result.scientific_assessment || result.scientific_caveat}</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <Sun className="w-10 h-10 mb-2 opacity-40 text-amber-400" />
              <p className="text-sm">Configure metal, size, and surrounding index to compute LSPR.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
