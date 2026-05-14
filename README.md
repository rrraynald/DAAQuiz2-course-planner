# 🎓 Course Prerequisite Planner

**DAA Group Project — Teknik Informatika ITS**

A web application that models university curriculum prerequisites as a Directed Acyclic Graph (DAG) and uses graph algorithms to help students plan their semesters.

**Tech Stack:** Python Flask + Vanilla JS + vis-network

## Algorithms Implemented

| Algorithm | Technique | Purpose | Complexity |
|---|---|---|---|
| Semester Planner | Topological Sort (Kahn's BFS) | Generate valid semester plan with SKS cap | O(V + E) |
| Cycle Detection | DFS with 3-Color Marking | Detect circular prerequisite dependencies | O(V + E) |
| Ancestor Query | Reverse BFS | "What do I need before course X?" | O(V + E) |
| Descendant Query | Forward BFS | "What does passing course X unlock?" | O(V + E) |
| Track Filter | BFS Ancestor Collection | Filter by concentration/track | O(V + E) |

## Features

- ✅ Semester plan respecting prerequisites & max SKS per semester
- ✅ Interactive prerequisite graph visualization (vis-network)
- ✅ Course ancestor & descendant queries
- ✅ Cycle detection with error reporting
- ✅ Mark completed courses
- ✅ 8 concentration tracks (AI/ML, Cybersecurity, Networking, etc.)
- ✅ Algorithm explanations with pseudocode & complexity analysis

## Run Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the app
python app.py
```

Open `http://localhost:5000` in your browser.

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — just click Deploy
5. Your app will be live at `https://course-planner-xxxx.onrender.com`

## Deploy to Railway (Free)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway auto-detects the Procfile
4. Done — live URL generated automatically

## Project Structure

```
course-planner/
├── app.py              # Flask backend + API routes
├── graph_engine.py     # All graph algorithms
├── data.py             # ITS Informatika curriculum data
├── requirements.txt    # Python dependencies
├── Procfile            # For deployment
├── render.yaml         # Render deployment config
├── templates/
│   └── index.html      # Main page
└── static/
    ├── css/style.css   # Styling
    └── js/app.js       # Frontend logic
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/courses` | GET | Get all courses |
| `/api/tracks` | GET | Get available tracks |
| `/api/plan` | POST | Generate semester plan |
| `/api/cycle` | GET | Check for cycles |
| `/api/ancestors/<code>` | GET | Get prerequisite ancestors |
| `/api/descendants/<code>` | GET | Get descendant courses |
| `/api/graph?track=` | GET | Get graph data for visualization |
| `/api/topo` | GET | Get topological sort ordering |
