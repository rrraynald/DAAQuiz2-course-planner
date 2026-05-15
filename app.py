"""
Course Prerequisite Planner - Flask Backend
DAA Group Project - Teknik Informatika ITS

REST API endpoints for the graph algorithms.
"""

from flask import Flask, render_template, jsonify, request
from graph_engine import CurriculumGraph
from data import load_curriculum

app = Flask(__name__)

# ──────────────────────────────────────────────
# Initialize Graph (once at startup)
# ──────────────────────────────────────────────
graph = CurriculumGraph()
for course in load_curriculum():
    graph.add_course(course)


# ──────────────────────────────────────────────
# Page Routes
# ──────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


# ──────────────────────────────────────────────
# API Routes
# ──────────────────────────────────────────────
@app.route("/api/courses")
def get_courses():
    """Get all courses with their metadata."""
    courses = []
    for code, c in graph.courses.items():
        courses.append({
            "code": c.code,
            "name": c.name,
            "sks": c.sks,
            "semester_type": c.semester_type,
            "prerequisites": c.prerequisites,
            "tracks": c.tracks,
        })
    return jsonify(courses)


@app.route("/api/tracks")
def get_tracks():
    """Get available concentration tracks."""
    return jsonify(graph.get_available_tracks())


@app.route("/api/plan", methods=["POST"])
def plan_semesters():
    """Generate semester plan. Accepts JSON body with options."""
    data = request.get_json() or {}
    valid_tracks = {"all"} | set(graph.get_available_tracks().keys())
    track = data.get("track", "all")
    if track not in valid_tracks:
        track = "all"
    max_sks = int(data.get("max_sks", 24))
    completed_raw = data.get("completed", [])
    completed = set(c for c in completed_raw if c in graph.courses)
    filter_semester = data.get("filter_semester", "all")
    include_electives = bool(data.get("include_electives", False))
    per_semester_sks_raw = data.get("per_semester_sks", {})
    per_semester_sks = {int(k): int(v) for k, v in per_semester_sks_raw.items() if str(v).isdigit()} if per_semester_sks_raw else None

    if track != "all":
        semesters = graph.plan_track(track, max_sks, completed, filter_semester, per_semester_sks)
        track_courses = {c for c, course in graph.courses.items() if track in course.tracks}
    else:
        semesters = graph.plan_semesters(max_sks, completed, filter_semester, include_electives, per_semester_sks)
        track_courses = None

    result = []
    for i, sem in enumerate(semesters):
        courses = []
        for code in sem:
            c = graph.courses[code]
            courses.append({
                "code": c.code,
                "name": c.name,
                "sks": c.sks,
                "is_track": track_courses is not None and code in track_courses,
                "tracks": c.tracks,
            })
        sem_sks = sum(graph.courses[c].sks for c in sem)
        cap = (per_semester_sks or {}).get(i + 1, max_sks)
        result.append({"semester": i + 1, "sks": sem_sks, "sks_cap": cap, "courses": courses})

    return jsonify({"semesters": result, "track": track})


@app.route("/api/cycle")
def check_cycle():
    """Check for cycles in the prerequisite graph."""
    cycle = graph.detect_cycle()
    if cycle:
        return jsonify({"has_cycle": True, "cycle": cycle})
    return jsonify({"has_cycle": False, "cycle": None})


@app.route("/api/ancestors/<code>")
def get_ancestors(code):
    """Get all prerequisite ancestors of a course (Reverse BFS)."""
    if code not in graph.courses:
        return jsonify({"error": "Course not found"}), 404

    ancestors = graph.get_ancestors(code)
    result = []
    for a in ancestors:
        c = graph.courses[a]
        result.append({"code": c.code, "name": c.name, "sks": c.sks})

    return jsonify({
        "course": code,
        "course_name": graph.courses[code].name,
        "ancestors": result,
        "total_sks": sum(r["sks"] for r in result),
    })


@app.route("/api/descendants/<code>")
def get_descendants(code):
    """Get all courses unlocked by completing a course (Forward BFS)."""
    if code not in graph.courses:
        return jsonify({"error": "Course not found"}), 404

    descendants = graph.get_descendants(code)
    result = []
    for d in descendants:
        c = graph.courses[d]
        result.append({"code": c.code, "name": c.name, "sks": c.sks})

    return jsonify({
        "course": code,
        "course_name": graph.courses[code].name,
        "descendants": result,
        "total_sks": sum(r["sks"] for r in result),
    })


@app.route("/api/graph")
def get_graph():
    """Get graph data for visualization. Optional track filter."""
    track = request.args.get("track", "all")

    if track != "all":
        visible = graph.get_track_courses(track)
        direct_track = {c for c, course in graph.courses.items() if track in course.tracks}
    else:
        visible = set(graph.courses.keys())
        direct_track = None

    nodes = []
    for code in visible:
        c = graph.courses[code]
        nodes.append({
            "id": c.code,
            "label": c.code,
            "name": c.name,
            "sks": c.sks,
            "tracks": c.tracks,
            "prerequisites": c.prerequisites,
            "is_track": direct_track is not None and code in direct_track,
        })

    edges = []
    for src, targets in graph.adj.items():
        for tgt in targets:
            if src in visible and tgt in visible:
                edges.append({"from": src, "to": tgt})

    return jsonify({"nodes": nodes, "edges": edges})


@app.route("/api/topo")
def topological_sort():
    """Get topological sort ordering."""
    result = graph.topological_sort()
    if result is None:
        return jsonify({"error": "Cycle detected", "order": None})
    return jsonify({"order": result})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
