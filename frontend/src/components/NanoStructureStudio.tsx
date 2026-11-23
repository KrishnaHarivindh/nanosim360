import React, { useState } from 'react';
import { Layers, Download, Atom } from 'lucide-react';

export const NanoStructureStudio: React.FC = () => {
  const [structureType, setStructureType] = useState<'graphene' | 'c60'>('graphene');
  const [nx, setNx] = useState<number>(4);
  const [ny, setNy] = useState<number>(4);
  const [dopant, setDopant] = useState<string>('none');
  const [dopantRatio, setDopantRatio] = useState<number>(0.1);
  const [vacancyCount, setVacancyCount] = useState<number>(1);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleBuild = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nanostructure/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structure_type: structureType,
          nx,
          ny,
          dopant_element: dopant === 'none' ? null : dopant,
          dopant_ratio: dopantRatio,
          vacancy_count: vacancyCount,
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

  const downloadXYZ = () => {
    if (!result?.xyz_format) return;
    const blob = new Blob([result.xyz_format], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${structureType}_nanosim360.xyz`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Layers className="w-7 h-7 text-indigo-400" />
          <span>NanoStructure Studio: Atomic Coordinate & Defect Builder</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Generate real 3D Cartesian coordinates (Å) for custom supercells, substitutional dopants (N/B), and atomic vacancies. Export directly to .XYZ format for VESTA / ASE / PyMOL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-slate-200 text-sm">Structure Configuration</h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Lattice Architecture</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setStructureType('graphene')}
                className={`py-2 rounded border font-medium ${
                  structureType === 'graphene' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-slate-800 text-slate-400'
                }`}
              >
                Graphene Monolayer
              </button>
              <button
                onClick={() => setStructureType('c60')}
                className={`py-2 rounded border font-medium ${
                  structureType === 'c60' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-slate-800 text-slate-400'
                }`}
              >
                Fullerene (C60)
              </button>
            </div>
          </div>

          {structureType === 'graphene' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Unit Cells X (nx)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={nx}
                    onChange={e => setNx(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unit Cells Y (ny)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={ny}
                    onChange={e => setNy(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Substitutional Dopant</label>
                  <select
                    value={dopant}
                    onChange={e => setDopant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="none">None (Pure Carbon)</option>
                    <option value="N">Nitrogen (N-doped)</option>
                    <option value="B">Boron (B-doped)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vacancies</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={vacancyCount}
                    onChange={e => setVacancyCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="dopant-ratio" className="text-slate-400">Dopant Concentration</label>
                  <span className="text-cyan-400 font-mono">{Math.round(dopantRatio * 100)}%</span>
                </div>
                <input
                  id="dopant-ratio"
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={Math.round(dopantRatio * 100)}
                  onChange={e => setDopantRatio(Number(e.target.value) / 100)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleBuild}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg text-sm"
          >
            {loading ? 'Synthesizing Coordinates...' : 'Generate 3D Atomic Structure'}
          </button>
        </div>

        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200 text-sm">Generated Atomic Coordinates</h3>
            {result?.xyz_format && (
              <button
                onClick={downloadXYZ}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg flex items-center space-x-1.5 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .XYZ File</span>
              </button>
            )}
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Total Atoms</span>
                  <span className="text-xl font-bold text-white">{result.total_atoms}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Dopant Element</span>
                  <span className="text-xl font-bold text-cyan-400">{result.dopant_element || 'None'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Vacancies</span>
                  <span className="text-xl font-bold text-rose-400">{result.vacancies_introduced || 0}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[11px] max-h-56 overflow-y-auto">
                <div className="text-slate-500 mb-1">// Cartesian coordinates (Angstroms)</div>
                <pre className="text-slate-300">{result.xyz_format}</pre>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <Atom className="w-10 h-10 mb-2 opacity-40 text-indigo-400" />
              <p className="text-sm">Configure parameters and click generate to synthesize coordinates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
