import React, { useState } from 'react';
import { Material } from '../types';
import { Search, Layers, ExternalLink, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  materials: Material[];
  onSelectFor3D: (slug: string) => void;
  onSelectForCompare: (slug: string) => void;
}

export const MaterialExplorer: React.FC<Props> = ({ materials, onSelectFor3D, onSelectForCompare }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeMaterialSlug, setActiveMaterialSlug] = useState<string | null>(materials[0]?.slug ?? null);

  const categories = ['All', ...Array.from(new Set(materials.map(m => m.category)))];

  const filteredMaterials = materials.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeMaterial = filteredMaterials.find(material => material.slug === activeMaterialSlug) ?? filteredMaterials[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>NanoMaterial Scientific Catalogue</span>
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Peer-reviewed catalogue of 0D, 1D, 2D, and 3D nanoscale systems with atomic properties, applications, and risk notes.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search formula, name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Card List (Left) + Detailed Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Material Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-2">
          {filteredMaterials.length === 0 && <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">No materials match these filters. Try another search or category.</p>}
          {filteredMaterials.map(m => {
            const isSelected = activeMaterial?.slug === m.slug;
            return (
              <button
                type="button"
                key={m.slug}
                onClick={() => setActiveMaterialSlug(m.slug)}
                aria-pressed={isSelected}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/80 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-semibold text-slate-100 text-sm">{m.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    {m.dimensionality} &bull; {m.formula}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{m.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Category: {m.category}</span>
                  <span className="font-mono">{m.density_g_cm3 ? `${m.density_g_cm3} g/cm³` : ''}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Inspector Panel */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          {activeMaterial ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">{activeMaterial.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Formula: {activeMaterial.formula}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400 mt-1">{activeMaterial.structure_type}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectFor3D(activeMaterial.slug)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-semibold rounded-lg flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View in 3D</span>
                  </button>
                  <button
                    onClick={() => onSelectForCompare(activeMaterial.slug)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                  >
                    Add to Compare
                  </button>
                </div>
              </div>

              {/* Physical & Electronic Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Electrical Properties</span>
                  <p className="text-slate-400 leading-relaxed">{activeMaterial.electrical_properties}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Optical Properties</span>
                  <p className="text-slate-400 leading-relaxed">{activeMaterial.optical_properties}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Mechanical Properties</span>
                  <p className="text-slate-400 leading-relaxed">{activeMaterial.mechanical_properties}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Bulk Density</span>
                  <p className="text-slate-400 font-mono">
                    {activeMaterial.density_g_cm3 ? `${activeMaterial.density_g_cm3} g/cm³ (${activeMaterial.density_g_cm3 * 1000} kg/m³)` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Applications & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-2">Key Applications</h4>
                  <ul className="space-y-1 text-slate-300">
                    {activeMaterial.applications.map((app, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 font-bold">&bull;</span>
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-rose-400 mb-2 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Limitations & Hazards</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300">
                    {activeMaterial.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-rose-500 font-bold">&bull;</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Peer-Reviewed References */}
              <div>
                <h4 className="font-semibold text-slate-300 text-xs mb-2 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Primary Scientific References</span>
                </h4>
                <div className="space-y-2">
                  {activeMaterial.references.map((ref, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
                      <div className="font-medium text-slate-200">{ref.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {ref.authors} ({ref.year}) &bull; DOI:{' '}
                        <a
                          href={`https://doi.org/${ref.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center space-x-0.5"
                        >
                          <span>{ref.doi}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Select a nanomaterial to view full technical specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
