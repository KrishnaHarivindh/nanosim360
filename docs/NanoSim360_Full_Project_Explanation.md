# NanoSim 360 — Full Project Explanation

**Project title:** NanoSim 360: Interactive Computational Framework for Nanomaterial Visualization, Property Modelling and Analysis  
**Course:** Nanotechnology in Societal Development  
**Institution:** SRM Institute of Science and Technology  
**Guide:** Dr. Karthika P C, Department of Physics and Nanotechnology

## 1. Project overview

NanoSim 360 is an educational web application that brings together selected nanomaterial records, scientific calculations, numerical models, image analysis, and three-dimensional geometry. It is designed to help students explore how particle dimensions, structure, material choice, and model assumptions affect computational outputs.

The project joins a React and TypeScript frontend with a FastAPI backend. The frontend presents the modules and collects inputs. The backend validates requests, performs calculations with Python modules, and returns results for display. Material information is stored in SQLite. The application runs locally in a browser.

NanoSim 360 is a learning and demonstration tool. It is not a laboratory instrument, a full atomistic simulator, or a source of experimentally validated predictions.

## 2. Problem and aim

Nanomaterial topics such as nanoscale geometry, optical response, particle-size distributions, and characterization are often taught using separate equations or tools. This can make it difficult for learners to connect the input parameters to the resulting calculations and visualizations.

The project aim is to provide one accessible interface where users can explore selected materials, change model inputs, observe computed results, and read the assumptions behind those results. It demonstrates computational methods used in nanotechnology; it does not claim to replace experiments or specialist research software.

## 3. Main modules

### Dashboard

The dashboard introduces the application and provides navigation to its computational modules. It gives a quick view of the available material records and the types of analyses supported.

### Material Explorer

The explorer presents eight selected material records, including carbon-based structures, metals, and metal oxides. Users can inspect properties and compare materials. The records are a small curated educational catalogue rather than an exhaustive or continuously updated database.

### Scientific Property Calculator

For a spherical particle with diameter `d` and radius `r = d/2`, the calculator uses:

- Volume: `V = (4/3)πr³`
- Surface area: `A = 4πr²`
- Surface-area-to-volume ratio: `A/V = 6/d`
- Particle mass: `m = ρV`
- Specific surface area: `SSA = A/m = 6/(ρd)`

The calculator converts supported input units to SI units internally, then reports readable results. These equations assume an ideal sphere with uniform bulk density. Real particles may be irregular, porous, aggregated, coated, or polydisperse.

### Carbon nanotube geometry

The CNT calculator uses the chiral indices `(n,m)` and graphene lattice constant `a ≈ 0.2461 nm`:

- Chiral vector length: `Cₕ = a√(n² + nm + m²)`
- Tube diameter: `dₜ = Cₕ/π`
- Chiral angle: `θ = tan⁻¹(√3m/(2n+m))`

The zone-folding rule classifies a tube as nominally metallic when `(n−m)` is divisible by 3; otherwise it is nominally semiconducting. This is an idealized classification. Curvature can open small band gaps in some nominally metallic tubes, and the simple rule is not a substitute for electronic-structure calculations.

### NanoOptics

The optical module models a spherical nanoparticle’s wavelength-dependent response using Mie theory. Users can vary supported particle and medium parameters and inspect calculated extinction, scattering, absorption, or resonance outputs. It demonstrates how particle size and optical properties enter a model.

The implementation uses a homogeneous-sphere approximation and tabulated optical constants. The model does not capture every real-particle effect, such as irregular shape, aggregation, surface coatings, substrate interactions, or all wavelength-dependent environmental effects. Numerical agreement with reference calculations checks implementation; it does not establish experimental validation.

### NanoSize

NanoSize generates simulated particle populations using supported statistical distributions. It reports summary measures and distribution information, helping users explore polydispersity and the effect of spread in particle dimensions. These are simulated populations, not measurements of a physical sample. Any interval calculated from them describes the simulation procedure, not laboratory measurement uncertainty.

### NanoCharacterize

The characterization module demonstrates two workflows:

- **XRD:** estimates a crystallite size from diffraction inputs using a Scherrer-style relationship. The result depends on the supplied peak width, wavelength, shape factor, and angle conventions; instrument broadening and other real sample effects require careful treatment.
- **TEM image analysis:** estimates particle regions and dimensions from an uploaded image. Results depend on image contrast, segmentation threshold, scale calibration, and whether particles overlap. It is an image-analysis estimate, not a replacement for expert microscopy analysis.

### 3D Nano Lab and NanoStructure Studio

The 3D Nano Lab displays idealized geometries such as graphene sheets, carbon nanotubes, and nanoparticle-like structures. Users can change supported parameters and inspect the resulting shape.

NanoStructure Studio generates Cartesian coordinates for supported structures and permits XYZ export. These coordinates are geometric representations. They are not energy-minimized, chemically validated, or equivalent to molecular dynamics or density functional theory results.

### ML Bandgap Predictor

The predictor demonstrates a machine-learning workflow using a Gradient Boosting Regression model. Its training labels are synthetic values generated from a simplified Brus quantum-confinement equation with added noise. Holdout metrics describe how closely the model reproduces those synthetic labels.

This is an ML surrogate for a mathematical model. It is **not** an independently validated experimental bandgap predictor, and its reported score must not be presented as experimental accuracy.

### Material Comparison and NanoDesign

Material Comparison places selected catalogue properties side by side and supports export of comparison data. NanoDesign applies a TOPSIS-style multi-criteria ranking to curated suitability ratings and user criteria. The ranking calculation is computed, but its inputs are heuristic ratings. The resulting score is an educational decision-support example, not a measured property, safety assessment, or definitive recommendation.

## 4. Architecture and data flow

1. A user selects a module and enters parameters in the browser.
2. The React and TypeScript interface validates basic fields and sends the request to the local API.
3. FastAPI validates the request and routes it to the relevant Python calculation or analysis module.
4. The backend reads material records from SQLite when needed and returns structured results with units and explanatory information.
5. The frontend displays results, charts, tables, or geometry and provides relevant export controls.

**Technology summary:** React, TypeScript, Vite, Three.js, FastAPI, Python scientific modules, Pydantic request models, and SQLite.

## 5. What the project demonstrates

- A modular web application can connect several nanotechnology learning workflows.
- Equations can be exposed through interactive inputs and unit-aware outputs.
- Visualizing geometry can support learning about nanoscale shape and arrangement.
- Statistical simulations can demonstrate population variability.
- Image analysis and numerical models need explicit assumptions and calibration.
- Machine-learning metrics only mean what their labels and evaluation data support.
- A computed material ranking can still depend on subjective or curated input ratings.

## 6. Testing and verification

The project’s latest recorded verification included 22 passing backend tests, a successful frontend production build, and a successful frontend lint check. Manual browser checks covered the main navigation pages and core workflows, including property calculations, CNT geometry, Mie optics, NanoSize, XRD and TEM analysis, ML prediction, NanoDesign, material comparison, 3D visualization, and coordinate export.

A successful build or software test does not independently prove scientific validity. Independent experimental validation remains future work. The frontend build may report that the Three.js bundle is larger than Vite’s suggested threshold; the build still succeeds.

## 7. Demonstration script (about 5–7 minutes)

1. **Opening (30 seconds):** “NanoSim 360 is an educational platform for exploring nanomaterials through calculations, visualizations, and simplified models.”
2. **Dashboard and explorer (45 seconds):** show the module navigation and open a few material records. Explain that the catalogue is curated and limited in size.
3. **Property calculator and CNT (60 seconds):** enter a particle diameter, interpret SA/V and SSA with units, then show a CNT chiral index and explain the zone-folding rule.
4. **3D modules (45 seconds):** change the selected geometry, then show generated coordinates or the XYZ export. State that structures are idealized and not energy-relaxed.
5. **NanoOptics (45 seconds):** run a calculation and point out the wavelength-dependent response and spherical-particle assumptions.
6. **NanoSize and NanoCharacterize (60 seconds):** show a simulated distribution, then briefly demonstrate XRD or TEM and name the calibration or segmentation dependence.
7. **ML and NanoDesign (60 seconds):** show the ML predictor and explicitly state its labels come from the Brus equation. Show the TOPSIS ranking and explain that its suitability ratings are heuristic.
8. **Closing (30 seconds):** “The application connects selected models in one learning interface. Its outputs are computational demonstrations and need experimental validation before they are used as real-world material claims.”

Keep the browser at a readable zoom, move the cursor slowly, and pause on results. Close notifications and unrelated windows before recording. Do not show terminal windows unless explaining setup.

## 8. How to run

Use two PowerShell windows. In the first:

```powershell
cd .
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

In the second:

```powershell
cd .\frontend
npm.cmd install
npm.cmd run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`. Keep both windows running while using the application. API documentation is available at `http://127.0.0.1:8000/docs`.

To run backend tests with the backend available:

```powershell
cd .
.\.venv\Scripts\python.exe -m pytest -q
```

## 9. Future work

Potential next steps include validation against independent experimental datasets, additional trusted material records with provenance, improved treatment of non-spherical and heterogeneous particles, calibration-aware image analysis, quantified uncertainty, more complete CNT electronic models, and further frontend code splitting to reduce the initial Three.js download.
