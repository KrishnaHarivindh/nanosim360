# NanoSim360

NanoSim360 is an educational nanomaterials exploration app with a FastAPI backend and a React/Vite frontend. It includes particle calculations, material exploration, visualizations, and simplified optical and machine learning models.

## Quick start

Requirements: Python 3.12 or later, Node.js 20.19+ or 22.12+.

From the repository root, start the backend:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173. The backend API documentation is at http://127.0.0.1:8000/docs.

## Scientific scope

The bandgap regressor is trained on synthetic labels generated from the Brus effective-mass equation with added noise. Its holdout metrics describe agreement with those equation-derived labels; they are not experimental validation, calibrated uncertainty bounds, or a substitute for measurement. CNT metallicity follows a simplified zone-folding rule, and material recommendations are heuristic decision-support scores rather than measured constants. See [the full project explanation](docs/NanoSim360_Full_Project_Explanation.md) and [demonstration guide](docs/DEMONSTRATION_GUIDE.md) for more context.

## Repository contents

- `backend/`: API, scientific calculations, seed catalog, and source tests
- `frontend/`: React application and Vite configuration
- `docs/`: project explanation, demo guide, and release notes

Runtime databases, generated model files, virtual environments, dependency folders, course materials, identity documents, and academic reports are intentionally not tracked.
