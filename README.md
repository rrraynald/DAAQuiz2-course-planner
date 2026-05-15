# PATHWAY — Informatics ITS Course Planner

A web app that helps Informatics ITS students plan their semester journey.
Enter which courses you've completed, pick a concentration track, and Pathway generates a valid semester-by-semester study plan — automatically respecting every prerequisite in the ITS Informatics 2023 Curriculum.

---

## What it does

- **Semester Planner** — shows which courses to take each semester, in a valid order that honors all prerequisites
- **Prerequisite Graph** — visualizes the full curriculum as an interactive graph so you can see how courses connect
- **Course Query** — pick any course to see every prerequisite it needs and every course it unlocks
- **Track Filter** — focus the plan on one of 8 concentration tracks (AI/ML, Cybersecurity, Networking, Software Engineering, Game Dev, Data, Database, or Core)
- **Mark Completed Courses** — check off courses you have already passed; Pathway removes them from your plan automatically

---

## How to run locally

**Requirements:** Python 3.11 or newer

```bash
# 1. Clone the repository
git clone <repo-url>
cd pathway-course-planner

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the app
python app.py
```

Then open your browser and go to:

```
http://localhost:5000
```

---

## Project Structure

```
pathway-course-planner/
├── app.py              # Web server & API
├── graph_engine.py     # Graph algorithms (Kahn's, BFS, DFS)
├── data.py             # ITS Informatics 2023 curriculum data
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # Main page
└── static/
    ├── css/style.css   # Styling
    ├── js/app.js       # Frontend logic
    └── vendor/         # vis-network (graph visualization library)
```

---

## Authors

Built as a DAA (Design & Analysis of Algorithms) group project.

**Informatics ITS — Batch 2024**

- Raynald Ramadhani Fachriansyah
- Jason Kumarkono
- Christian Mikaxelo

&copy; 2024 Teknik Informatika ITS. All rights reserved.
