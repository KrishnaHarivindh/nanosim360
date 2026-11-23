import React, { useState, useEffect, Suspense } from 'react';
import { Material, DashboardSummary } from './types';
const MaterialExplorer = React.lazy(() => import('./components/MaterialExplorer').then(m => ({ default: m.MaterialExplorer })));
const PropertyCalculator = React.lazy(() => import('./components/PropertyCalculator').then(m => ({ default: m.PropertyCalculator })));
const MaterialComparison = React.lazy(() => import('./components/MaterialComparison').then(m => ({ default: m.MaterialComparison })));
const MLPredictor = React.lazy(() => import('./components/MLPredictor').then(m => ({ default: m.MLPredictor })));
const Nano3DViewer = React.lazy(() => import('./components/Nano3DViewer').then(m => ({ default: m.Nano3DViewer })));
const NanoOptics = React.lazy(() => import('./components/NanoOptics').then(m => ({ default: m.NanoOptics })));
const NanoCharacterize = React.lazy(() => import('./components/NanoCharacterize').then(m => ({ default: m.NanoCharacterize })));
const NanoDesign = React.lazy(() => import('./components/NanoDesign').then(m => ({ default: m.NanoDesign })));
const NanoStructureStudio = React.lazy(() => import('./components/NanoStructureStudio').then(m => ({ default: m.NanoStructureStudio })));
const NanoSize = React.lazy(() => import('./components/NanoSize').then(m => ({ default: m.NanoSize })));
import {
  Layers,
  Box,
  Calculator,
  BrainCircuit,
  ArrowLeftRight,
  BookOpen,
  LayoutDashboard,
  Sun,
  Microscope,
  Target,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'studio' | '3d' | 'calculator' | 'optics' | 'characterize' | 'size' | 'design' | 'ml' | 'comparison' | 'library'>('dashboard');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [comparisonSlugs, setComparisonSlugs] = useState<string[]>(['graphene', 'cnt']);

  // 3D Lab controls state
  const [selected3DStructure, setSelected3DStructure] = useState<'graphene' | 'cnt' | 'nanoparticle' | 'quantum_dot'>('graphene');
  const [grapheneRows, setGrapheneRows] = useState<number>(6);
  const [cntN, setCntN] = useState<number>(10);
  const [cntM, setCntM] = useState<number>(10);
  const [particleDiameter, setParticleDiameter] = useState<number>(4.0);
  const [particleShape, setParticleShape] = useState<'sphere' | 'polyhedron'>('sphere');

  // Fetch initial data
  useEffect(() => {
    fetch('/api/materials')
      .then(res => { if (!res.ok) throw new Error('Materials API unavailable'); return res.json(); })
      .then(data => { setMaterials(data); setApiOnline(true); })
      .catch(() => setApiOnline(false));

    fetch('/api/dashboard/summary')
      .then(res => { if (!res.ok) throw new Error('Dashboard API unavailable'); return res.json(); })
      .then(data => setSummary(data))
      .catch(() => setApiOnline(false));
  }, []);

  const handleSelectFor3D = (slug: string) => {
    if (slug === 'graphene') setSelected3DStructure('graphene');
    else if (slug === 'cnt') setSelected3DStructure('cnt');
    else if (slug === 'quantum-dots') setSelected3DStructure('quantum_dot');
    else setSelected3DStructure('nanoparticle');
    setActiveTab('3d');
  };

  return (
    <div className="nano-workspace flex h-screen bg-[#0b0f17] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-700 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/20">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-wide flex items-center space-x-1">
                <span>NanoSim</span>
                <span className="text-cyan-400">360</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">COMPUTATIONAL LAB</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'explorer'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>NanoMaterial Explorer</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'studio'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>NanoStructure Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('3d')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === '3d'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Interactive 3D Nano Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'calculator'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Property Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('optics')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'optics'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>NanoOptics (Mie Theory)</span>
            </button>

            <button
              onClick={() => setActiveTab('characterize')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'characterize'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Microscope className="w-4 h-4" />
              <span>NanoCharacterize</span>
            </button>

            <button
              onClick={() => setActiveTab('size')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'size'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>NanoSize (Monte Carlo)</span>
            </button>

            <button
              onClick={() => setActiveTab('design')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'design'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>NanoDesign (MCDA)</span>
            </button>

            <button
              onClick={() => setActiveTab('ml')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'ml'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>AI Property Predictor</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'comparison'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Material Comparison</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'library'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Research Library</span>
            </button>
          </nav>
        </div>

        {/* System & Syllabus Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-[11px] text-cyan-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{apiOnline ? 'API Online' : 'API Offline'} &bull; Local Host</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            CSE Cloud Specialization &bull; Nanotechnology in Societal Development (21NT0404T)
          </p>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span>Framework</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
              FastAPI + Three.js + Scikit-Learn
            </span>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-8">
          <Suspense fallback={<div role="status" className="text-sm text-slate-400">Loading this lab module…</div>}>
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white">NanoSim 360 Workspace Overview</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Educational platform for exploring nanomaterials through 3D visualization, simplified physical models, and model-based estimates.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Catalogued Nanomaterials</span>
                  <span className="text-2xl font-bold text-cyan-400">{materials.length} Systems</span>
                  <span className="text-[11px] text-slate-500 block mt-1">0D, 1D, 2D & 3D Structures</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Calculations Executed</span>
                  <span className="text-2xl font-bold text-emerald-400">{summary?.total_calculations_logged || 0}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">SA/V, SSA & Count</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Active ML Models</span>
                  <span className="text-2xl font-bold text-indigo-400">1 Online</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Quantum Confinement GBR</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Interactive 3D Engine</span>
                  <span className="text-2xl font-bold text-amber-400">Three.js</span>
                  <span className="text-[11px] text-slate-500 block mt-1">WebGL GPU Accelerated</span>
                </div>
              </div>

              {/* Quick Actions & Featured Structure Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-200 text-sm">Featured 3D Nanostructure: Graphene Honeycomb</h3>
                    <button
                      onClick={() => setActiveTab('3d')}
                      className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Open in Full 3D Lab</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="h-80 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
                    <svg viewBox="0 0 600 320" className="w-full h-full" role="img" aria-label="Schematic graphene honeycomb preview">
                      <defs>
                        <pattern id="graphene-preview" width="78" height="90" patternUnits="userSpaceOnUse">
                          <path d="M0 22.5 19.5 11.25 39 22.5 39 45 19.5 56.25 0 45Z M39 22.5 58.5 11.25 78 22.5 78 45 58.5 56.25 39 45Z M19.5 56.25 39 45 58.5 56.25 58.5 78.75 39 90 19.5 78.75Z" fill="none" stroke="#155e75" strokeWidth="1.5" />
                          <g fill="#67e8f9">
                            <circle cx="0" cy="22.5" r="3" /><circle cx="19.5" cy="11.25" r="3" /><circle cx="39" cy="22.5" r="3" /><circle cx="58.5" cy="11.25" r="3" /><circle cx="78" cy="22.5" r="3" />
                            <circle cx="0" cy="45" r="3" /><circle cx="19.5" cy="56.25" r="3" /><circle cx="39" cy="45" r="3" /><circle cx="58.5" cy="56.25" r="3" /><circle cx="78" cy="45" r="3" />
                            <circle cx="19.5" cy="78.75" r="3" /><circle cx="39" cy="90" r="3" /><circle cx="58.5" cy="78.75" r="3" />
                          </g>
                        </pattern>
                      </defs>
                      <rect width="600" height="320" fill="url(#graphene-preview)" />
                      <text x="300" y="285" textAnchor="middle" fill="#94a3b8" fontSize="13">Schematic lattice • Open the 3D Lab for interactive visualization</text>
                    </svg>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-200 text-sm mb-3">Syllabus & Viva Alignment (Unit III & IV)</h3>
                    <ul className="text-xs space-y-2 text-slate-400">
                      <li className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold">&bull;</span>
                        <span><strong className="text-slate-200">NBIC Convergence:</strong> Demonstrates Nanotechnology + Information Technology integration.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold">&bull;</span>
                        <span><strong className="text-slate-200">Nanoscale Scaling:</strong> Mathematical modeling of increased surface-area-to-volume ratio ($6/d$).</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold">&bull;</span>
                        <span><strong className="text-slate-200">Hazard vs Risk:</strong> Distinction between intrinsic toxicological hazard and actual exposure.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="font-semibold text-slate-200 text-sm">Direct Module Navigation</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => setActiveTab('explorer')}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left text-slate-300"
                      >
                        Material Explorer &rarr;
                      </button>
                      <button
                        onClick={() => setActiveTab('calculator')}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left text-slate-300"
                      >
                        Property Calculator &rarr;
                      </button>
                      <button
                        onClick={() => setActiveTab('ml')}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left text-slate-300"
                      >
                        ML Property Predictor &rarr;
                      </button>
                      <button
                        onClick={() => setActiveTab('comparison')}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left text-slate-300"
                      >
                        Comparison Matrix &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATERIAL EXPLORER */}
          {activeTab === 'explorer' && (
            <MaterialExplorer
              materials={materials}
              onSelectFor3D={handleSelectFor3D}
              onSelectForCompare={(slug) => {
                setComparisonSlugs(current => current.includes(slug) || current.length >= 4 ? current : [...current, slug]);
                setActiveTab('comparison');
              }}
            />
          )}

          {/* TAB: NANO-STRUCTURE STUDIO */}
          {activeTab === 'studio' && <NanoStructureStudio />}

          {/* TAB 3: INTERACTIVE 3D NANO LAB */}
          {activeTab === '3d' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Box className="w-6 h-6 text-cyan-400" />
                    <span>Interactive 3D Nanostructure Laboratory</span>
                  </h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Real-time GPU-accelerated Three.js viewport for atomic arrangements, chiral roll-up geometries, and nanoparticles.
                  </p>
                </div>

                {/* Structure Switcher Buttons */}
                <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg space-x-1 text-xs">
                  <button
                    onClick={() => setSelected3DStructure('graphene')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      selected3DStructure === 'graphene' ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Graphene Monolayer
                  </button>
                  <button
                    onClick={() => setSelected3DStructure('cnt')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      selected3DStructure === 'cnt' ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Carbon Nanotube (CNT)
                  </button>
                  <button
                    onClick={() => setSelected3DStructure('nanoparticle')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      selected3DStructure === 'nanoparticle' ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Nanoparticle / Cluster
                  </button>
                  <button
                    onClick={() => setSelected3DStructure('quantum_dot')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      selected3DStructure === 'quantum_dot' ? 'bg-cyan-600 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Core-Shell Quantum Dot
                  </button>
                </div>
              </div>

              {/* Viewport and Parameter Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <Nano3DViewer
                    structureType={selected3DStructure}
                    rows={grapheneRows}
                    cols={grapheneRows}
                    cntN={cntN}
                    cntM={cntM}
                    particleDiameter={particleDiameter}
                    particleShape={particleShape}
                  />
                </div>

                {/* Interactive Parameter Controls Sidebar */}
                <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
                  <h3 className="font-semibold text-slate-200 text-sm">Geometric Control Parameters</h3>

                  {selected3DStructure === 'graphene' && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Lattice Unit Cell Spans</span>
                          <span className="text-cyan-400 font-mono">{grapheneRows * 2}x{grapheneRows * 2}</span>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="12"
                          value={grapheneRows}
                          onChange={e => setGrapheneRows(parseInt(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                      <div className="p-3 bg-slate-950 rounded text-xs text-slate-400 space-y-1">
                        <div>&bull; C-C Bond Length: <span className="font-mono text-cyan-300">0.142 nm</span></div>
                        <div>&bull; Honeycomb Sp² Hybridized Orbitals</div>
                      </div>
                    </div>
                  )}

                  {selected3DStructure === 'cnt' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Chiral Index n</label>
                          <input
                            type="number"
                            min="3"
                            max="20"
                            value={cntN}
                            onChange={e => setCntN(parseInt(e.target.value) || 3)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Chiral Index m</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={cntM}
                            onChange={e => setCntM(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded text-xs text-slate-400 space-y-1">
                        <div>&bull; Type: <span className="text-cyan-300">{cntN === cntM ? 'Armchair' : cntM === 0 ? 'Zigzag' : 'Chiral'}</span></div>
                        <div>&bull; Electronic: <span className="text-amber-400">{(cntN - cntM) % 3 === 0 ? 'Metallic' : 'Semiconducting'}</span></div>
                      </div>
                    </div>
                  )}

                  {(selected3DStructure === 'nanoparticle' || selected3DStructure === 'quantum_dot') && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Particle Diameter</span>
                          <span className="text-cyan-400 font-mono">{particleDiameter.toFixed(1)} nm</span>
                        </div>
                        <input
                          type="range"
                          min="2.0"
                          max="8.0"
                          step="0.2"
                          value={particleDiameter}
                          onChange={e => setParticleDiameter(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      {selected3DStructure === 'nanoparticle' && (
                        <div>
                          <label className="text-xs text-slate-400 block mb-1.5">Nanocrystal Morphology</label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              onClick={() => setParticleShape('sphere')}
                              className={`py-1.5 rounded border text-center ${
                                particleShape === 'sphere' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'
                              }`}
                            >
                              Spherical
                            </button>
                            <button
                              onClick={() => setParticleShape('polyhedron')}
                              className={`py-1.5 rounded border text-center ${
                                particleShape === 'polyhedron' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'
                              }`}
                            >
                              Facet Polyhedron
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROPERTY CALCULATOR */}
          {activeTab === 'calculator' && <PropertyCalculator materials={materials} />}

          {/* TAB: NANO-OPTICS */}
          {activeTab === 'optics' && <NanoOptics />}

          {/* TAB: NANO-CHARACTERIZE */}
          {activeTab === 'characterize' && <NanoCharacterize />}

          {/* TAB: NANO-SIZE */}
          {activeTab === 'size' && <NanoSize />}

          {/* TAB: NANO-DESIGN */}
          {activeTab === 'design' && <NanoDesign />}

          {/* TAB 5: AI PROPERTY PREDICTOR */}
          {activeTab === 'ml' && <MLPredictor />}

          {/* TAB 6: COMPARISON MATRIX */}
          {activeTab === 'comparison' && <MaterialComparison materials={materials} selectedSlugs={comparisonSlugs} onSelectionChange={setComparisonSlugs} />}

          {/* TAB 7: RESEARCH LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  <span>Nanotechnology Research Library & Course Notes</span>
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Archived citations, legal/ethical governance handouts, and course note alignments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Course Curriculum Handouts (21NT0404T)</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="font-semibold text-slate-200">Unit-3: Nanotechnology in Societal Development</div>
                      <p className="text-slate-400 mt-1">
                        Explores NBIC Convergence (Nano-Bio-Info-Cogno), computing hardware innovations, sensor networks, and industrial manufacturing transitions.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="font-semibold text-slate-200">Unit-4: Law, Regulation, Ethics & Governance</div>
                      <p className="text-slate-400 mt-1">
                        Covers nanosafety standards, hazard vs. risk evaluation, lifecycle assessments (LCA), and ethical responsibilities in nanomaterial deployment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span>Foundational Scientific Literature</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                      <span className="font-medium text-slate-200 block">Novoselov, Geim et al. (2004)</span>
                      <span className="text-slate-400 block text-[11px]">"Electric Field Effect in Atomically Thin Carbon Films", Science</span>
                      <span className="text-cyan-400 font-mono text-[10px]">DOI: 10.1126/science.1102896</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                      <span className="font-medium text-slate-200 block">Iijima, S. (1991)</span>
                      <span className="text-slate-400 block text-[11px]">"Helical microtubules of graphitic carbon", Nature</span>
                      <span className="text-cyan-400 font-mono text-[10px]">DOI: 10.1038/354056a0</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                      <span className="font-medium text-slate-200 block">Brus, L. E. (1984)</span>
                      <span className="text-slate-400 block text-[11px]">"Electronic wave functions in small semiconductor particles", J. Chem. Phys.</span>
                      <span className="text-cyan-400 font-mono text-[10px]">DOI: 10.1063/1.447218</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;

