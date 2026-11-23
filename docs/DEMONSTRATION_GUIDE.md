# NanoSim 360 — Demonstration Guide

## Before the demonstration

1. Start the API and frontend using the commands in `README.md`.
2. Open `http://localhost:5173` and confirm the dashboard reports 8 catalogued materials.
3. Keep the API docs open at `http://127.0.0.1:8000/docs` if you want to show the service interface.

## Suggested 5-minute sequence

1. **Dashboard:** explain that the app is an educational simulation environment. Its numerical outputs are model estimates, not laboratory measurements.
2. **Material Explorer:** open a material such as Gold Nanoparticles or Graphene, show the reference properties, then use its action to open the 3D Lab.
3. **3D Nano Lab:** switch between graphene, CNT, and nanoparticle views; rotate and zoom the scene. This is a geometric visualization, not an atomistic energy-minimized simulation.
4. **Property Calculator:** use 20 nm gold at 19.32 g/cm³. Expected sphere values: SA/V = 0.3000 nm⁻¹ (3.00×10⁸ m⁻¹), SSA ≈ 15.53 m²/g, volume ≈ 4.189×10³ nm³, mass ≈ 8.093×10⁻¹⁷ g. Open the CNT tab and show a (10,10) armchair example.
5. **NanoOptics:** compute the default 20 nm gold sphere in water. Explain that the full Mie series is compared with the dipole approximation; the optical constants and spherical homogeneous-particle assumptions limit the result.
6. **NanoSize:** simulate a 20 nm mean with 3 nm standard deviation. Point out number-weighted versus volume-weighted means and the bootstrap interval for the simulated ensemble.
7. **NanoCharacterize:** calculate an XRD Scherrer estimate. For TEM, select a grayscale micrograph and enter its calibration; the analyzer reports image-segmentation estimates and errors if it detects no particles.
8. **NanoDesign:** run the photocatalysis or biomedical ranking. Explain that TOPSIS calculates the ranking from curated heuristic ratings.
9. **ML Predictor:** use the CdSe preset. Explain that the model learns noisy Brus-equation outputs and its holdout metrics are against synthetic labels, not experimental measurements.
10. **Close:** state the key boundaries: simplified physics, coarse material optical data, heuristic recommendations, and the need for experimental validation.

## Validation commands

With the backend server running from the project root:

```powershell
python -m pytest -q
cd frontend
npm run build
```

`python -m pytest` includes API tests that call `http://127.0.0.1:8000`, so the backend must be running in another terminal.
