import React, { useState } from 'react';
import { Target, Award } from 'lucide-react';

export const NanoDesign: React.FC = () => {
  const [application, setApplication] = useState<string>('photocatalysis');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nanodesign/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_application: application }),
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
          <Target className="w-7 h-7 text-rose-400" />
          <span>NanoDesign: Intelligent Multi-Criteria Material Selection</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          TOPSIS ranks candidates from curated 1–10 suitability ratings for each application. Ratings are heuristic decision-support inputs, not measured properties or safety assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-slate-200 text-sm">Target Application & Objective</h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Application Target</label>
            <select
              value={application}
              onChange={e => setApplication(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="photocatalysis">Solar Photocatalytic Water Purification</option>
              <option value="biomedical_diagnostics">Biomedical Diagnostic LSPR Biosensing</option>
              <option value="energy_storage">Supercapacitor & Battery Electrodes</option>
            </select>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <span className="text-rose-400 font-semibold block mb-1">MCDA Optimization Algorithm:</span>
            <p>Calculates normalized vector distances to ideal and least-suitable candidates using the selected application weights.</p>
          </div>

          <button
            onClick={handleRecommend}
            disabled={loading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-lg text-sm"
          >
            {loading ? 'Evaluating Material Matrix...' : 'Run Material Candidate Ranking'}
          </button>
        </div>

        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold text-slate-200 text-sm mb-4">Ranked Nanomaterial Recommendations</h3>

          {result ? (
            <div className="space-y-4">
              <div className="bg-rose-950/20 border border-rose-800/60 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-rose-300 font-semibold block">Top Recommended Candidate:</span>
                  <span className="text-xl font-bold text-white">{result.top_recommended_candidate}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-rose-400 font-mono bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800">
                  <Award className="w-4 h-4" />
                  <span>Utility: {result.rankings[0].utility_score} / 100</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {result.rankings.map((cand: any, idx: number) => (
                  <div
                    key={cand.slug}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                        <span className="font-semibold text-slate-200">{cand.name}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{cand.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-cyan-400">{cand.utility_score}</span>
                      <span className="text-[10px] text-slate-500 block">score</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <Target className="w-10 h-10 mb-2 opacity-40 text-rose-400" />
              <p className="text-sm">Select an application and click ranking to evaluate candidate materials.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
