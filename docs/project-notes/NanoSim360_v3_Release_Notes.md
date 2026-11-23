# NanoSim 360 v3.0 — Release Notes

## Release scope

This archive contains the top-level NanoSim 360 application, backend model file, frontend source and lockfile, scientific tests, README, demonstration guide, and viva guide. It leaves out installed dependencies, build output, local SQLite data, the nested duplicate project, and unrelated course files.

## Verification

- Backend suite: 22 passed in a clean Python 3.12 virtual environment.
- Frontend clean install: `npm ci` completed with no reported vulnerabilities.
- Frontend lint and production build: passed.
- Browser demonstration: dashboard, material explorer, 3D lab, calculator, Mie optics, NanoSize, and ML predictor were exercised.
- Mie recurrence: compared with independent SciPy spherical-Bessel calculations and the published MIEV0 case described in `docs/VIVA_PREPARATION.md`.

## Limitations

Independent experimental validation has not been performed. ML metrics use synthetic Brus-equation labels. NanoDesign ratings are heuristic. The optical calculation depends on tabulated constants and a homogeneous-sphere approximation. The Three.js chunk remains larger than Vite's 500 KB warning threshold after minification.

## Installation note

The README uses `py -3.12` because `py -3` selected Python 3.15 on the validation machine, where a pinned dependency lacked a compatible wheel and attempted a source build. The clean setup succeeded with Python 3.12.
