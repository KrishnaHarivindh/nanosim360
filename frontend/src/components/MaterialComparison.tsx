import React from 'react';
import { Material } from '../types';
import { ArrowLeftRight, Check, FileSpreadsheet } from 'lucide-react';

interface Props {
  materials: Material[];
  selectedSlugs: string[];
  onSelectionChange: (slugs: string[]) => void;
}

export const MaterialComparison: React.FC<Props> = ({ materials, selectedSlugs, onSelectionChange }) => {
  const toggleMaterial = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length > 2) {
        onSelectionChange(selectedSlugs.filter(s => s !== slug));
      }
    } else {
      if (selectedSlugs.length < 4) {
        onSelectionChange([...selectedSlugs, slug]);
      }
    }
  };

  const comparedMaterials = materials.filter(m => selectedSlugs.includes(m.slug));

  const exportCSV = () => {
    const headers = ['Property', ...comparedMaterials.map(m => m.name)];
    const rows = [
      ['Formula', ...comparedMaterials.map(m => m.formula)],
      ['Category', ...comparedMaterials.map(m => m.category)],
      ['Dimensionality', ...comparedMaterials.map(m => m.dimensionality)],
      ['Density (g/cm³)', ...comparedMaterials.map(m => m.density_g_cm3?.toString() || 'N/A')],
      ['Structure Type', ...comparedMaterials.map(m => `"${m.structure_type}"`)],
      ['Electrical Properties', ...comparedMaterials.map(m => `"${m.electrical_properties}"`)],
      ['Optical Properties', ...comparedMaterials.map(m => `"${m.optical_properties}"`)],
      ['Mechanical Properties', ...comparedMaterials.map(m => `"${m.mechanical_properties}"`)],
    ];

    const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    const objectUrl = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'NanoSim360_Material_Comparison.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <ArrowLeftRight className="w-6 h-6 text-cyan-400" />
            <span>Comparative Nanomaterial Analysis Matrix</span>
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Cross-evaluate electronic confinement, morphology, mechanical moduli, and target applications.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Scientific CSV Matrix</span>
        </button>
      </div>

      {/* Selector Pills */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <span className="text-xs font-semibold text-slate-400 block mb-2.5">
          Select 2 to 4 materials to compare:
        </span>
        <div className="flex flex-wrap gap-2">
          {materials.map(m => {
            const isSelected = selectedSlugs.includes(m.slug);
            return (
              <button
                key={m.slug}
                onClick={() => toggleMaterial(m.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : null}
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="text-[11px] uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 w-44 font-semibold text-slate-200">Specification</th>
              {comparedMaterials.map(m => (
                <th key={m.slug} className="py-3 px-4 font-semibold text-cyan-400">
                  {m.name} ({m.formula})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Dimensionality</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4 font-mono text-cyan-300">
                  {m.dimensionality}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Category</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4">
                  {m.category}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Bulk Density</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4 font-mono">
                  {m.density_g_cm3 ? `${m.density_g_cm3} g/cm³` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Lattice & Structure</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4">
                  {m.structure_type}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Electrical Properties</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4 leading-relaxed">
                  {m.electrical_properties}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Optical Properties</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4 leading-relaxed">
                  {m.optical_properties}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Mechanical Modulus</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4 leading-relaxed">
                  {m.mechanical_properties}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Primary Advantages</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4">
                  <ul className="space-y-1">
                    {m.advantages.map((adv, i) => (
                      <li key={i} className="text-emerald-400">
                        &bull; {adv}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-slate-400 bg-slate-950/40">Known Limitations</td>
              {comparedMaterials.map(m => (
                <td key={m.slug} className="py-3 px-4">
                  <ul className="space-y-1">
                    {m.limitations.map((lim, i) => (
                      <li key={i} className="text-rose-400">
                        &bull; {lim}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
