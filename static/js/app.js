/**
 * Course Prerequisite Planner - Frontend
 * Handles API communication, graph rendering (vis-network), and UI state.
 */

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
let allCourses = [];
let allTracks = {};
let completed = new Set();
let currentTrack = "core";
let maxSks = 24;
let includeElectives = false;
let perSemesterSks = {};

// ──────────────────────────────────────────────
// Initialization
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    await loadInitialData();
    setupTabs();
    setupSidebar();
    refreshPlan();
});

async function loadInitialData() {
    const [coursesRes, tracksRes] = await Promise.all([
        fetch("/api/courses").then(r => r.json()),
        fetch("/api/tracks").then(r => r.json()),
    ]);
    allCourses = coursesRes;
    allTracks = tracksRes;

    populateTrackSelector();
    populateCompletedList();
    populateQuerySelector();
}

// ──────────────────────────────────────────────
// Tabs
// ──────────────────────────────────────────────
function setupTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            const target = document.getElementById(btn.dataset.tab);
            target.classList.add("active");

            if (btn.dataset.tab === "tab-graph") loadGraph();
            if (btn.dataset.tab === "tab-query") onQueryChange();
        });
    });
}

// ──────────────────────────────────────────────
// Sidebar Controls
// ──────────────────────────────────────────────
function setupSidebar() {
    // Track selector
    document.getElementById("track-select").addEventListener("change", e => {
        currentTrack = e.target.value;
        refreshPlan();
        if (document.getElementById("tab-graph").classList.contains("active")) loadGraph();
    });

    // Electives toggle
    document.getElementById("electives-toggle").addEventListener("change", e => {
        includeElectives = e.target.checked;
        refreshPlan();
    });

    // Completed search filter
    document.getElementById("completed-search").addEventListener("input", e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll("#completed-list label").forEach(label => {
            const text = label.textContent.toLowerCase();
            label.classList.toggle("hidden", q && !text.includes(q));
        });
    });
}

function populateTrackSelector() {
    const select = document.getElementById("track-select");
    select.innerHTML = '<option value="all">All Courses (No Filter)</option>';
    for (const [id, name] of Object.entries(allTracks)) {
        select.innerHTML += `<option value="${id}">${name}</option>`;
    }
    select.value = currentTrack;
}

function populateCompletedList() {
    const list = document.getElementById("completed-list");
    list.innerHTML = "";
    const sorted = [...allCourses].sort((a, b) => a.code.localeCompare(b.code));
    for (const c of sorted) {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${c.code}"> ${c.code}: ${c.name}`;
        label.querySelector("input").addEventListener("change", e => {
            if (e.target.checked) completed.add(c.code);
            else completed.delete(c.code);
            renderCompletedTags();
            refreshPlan();
        });
        list.appendChild(label);
    }
}

function renderCompletedTags() {
    const container = document.getElementById("completed-tags");
    container.innerHTML = "";
    for (const code of completed) {
        const tag = document.createElement("span");
        tag.className = "completed-tag";
        tag.textContent = code + " ✕";
        tag.addEventListener("click", () => {
            completed.delete(code);
            const cb = document.querySelector(`#completed-list input[value="${code}"]`);
            if (cb) cb.checked = false;
            renderCompletedTags();
            refreshPlan();
        });
        container.appendChild(tag);
    }
}

// ──────────────────────────────────────────────
// Semester Plan (Tab 1)
// ──────────────────────────────────────────────
async function refreshPlan() {
    const planArea = document.getElementById("plan-area");

    // Preserve scroll position + focused-input identity so updating a per-semester
    // SKS cap doesn't snap the page to the top.
    const scroller = document.querySelector(".main-content") || document.scrollingElement;
    const scrollTop = scroller ? scroller.scrollTop : 0;
    const winScrollY = window.scrollY;
    const active = document.activeElement;
    const focusedSem = (active && active.classList && active.classList.contains("sem-sks-cap"))
        ? active.dataset.sem : null;

    // Reserve current height so the spinner doesn't collapse the layout mid-fetch.
    const prevHeight = planArea.offsetHeight;
    if (prevHeight) planArea.style.minHeight = prevHeight + "px";
    planArea.innerHTML = '<div class="loading"><div class="spinner"></div>Generating plan</div>';

    const [planRes, cycleRes] = await Promise.all([
        fetch("/api/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                track: currentTrack,
                max_sks: maxSks,
                completed: [...completed],
                include_electives: includeElectives,
                per_semester_sks: perSemesterSks,
            }),
        }).then(r => r.json()),
        fetch("/api/cycle").then(r => r.json()),
    ]);

    let html = "";

    // Cycle check
    if (cycleRes.has_cycle) {
        html += `<div class="banner warning">Cycle Detected: ${cycleRes.cycle.join(" -> ")} -> ${cycleRes.cycle[0]}</div>`;
    } else {
        html += `<div class="banner success">No cycles detected - valid DAG</div>`;
    }

    // Track info
    if (currentTrack !== "all") {
        html += `<div class="banner info">Showing plan for <strong>${allTracks[currentTrack]}</strong> track (includes prerequisite courses)</div>`;
    } else {
        html += `<div class="banner info">Showing mandatory courses only. Semesters 5-6 are elective slots - select a concentration track above to fill them.</div>`;
    }

    const semesters = planRes.semesters;
    if (semesters.length === 0) {
        html += `<div class="banner success">All courses completed!</div>`;
        planArea.innerHTML = html;
        return;
    }

    // Metrics
    const totalCourses = semesters.reduce((s, sem) => s + sem.courses.length, 0);
    const totalSks = semesters.reduce((s, sem) => s + sem.sks, 0);

    html += `<div class="metrics">
        <div class="metric"><div class="value">${semesters.length}</div><div class="label">Semesters</div></div>
        <div class="metric"><div class="value">${totalCourses}</div><div class="label">Courses</div></div>
        <div class="metric"><div class="value">${totalSks}</div><div class="label">Total SKS</div></div>
        <div class="metric"><div class="value">${completed.size}</div><div class="label">Completed</div></div>
    </div>`;

    // Semester cards
    for (const sem of semesters) {
        let chips = "";
        for (const c of sem.courses) {
            let cls, prefix;
            if (c.is_completed) {
                cls = "completed";
                prefix = "✓ ";
            } else if (currentTrack !== "all") {
                cls = c.is_track ? "track" : "prereq";
                prefix = c.is_track ? "[T] " : "[P] ";
            } else {
                cls = "neutral";
                prefix = "";
            }
            chips += `<span class="course-chip ${cls}">
                ${prefix}<span class="chip-code">${c.code}</span> ${c.name} (${c.sks} SKS)
            </span>`;
        }

        html += `<div class="semester-card">
            <div class="semester-header">
                <span class="sem-title">Semester ${sem.semester}</span>
                <span class="sem-sks">${sem.sks} SKS · ${sem.courses.length} MK</span>
                <label class="sks-cap-label">Max SKS: <input
                    type="number" class="sem-sks-cap"
                    data-sem="${sem.semester}"
                    value="${sem.sks_cap}"
                    min="8" max="36" step="1"></label>
            </div>
            <div class="semester-courses">${chips}</div>
        </div>`;
    }

    if (currentTrack !== "all") {
        html += `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px">
            [T] = Track course &nbsp;&nbsp; [P] = Prerequisite (required foundation)</div>`;
    }

    planArea.innerHTML = html;
    planArea.style.minHeight = "";

    planArea.querySelectorAll(".sem-sks-cap").forEach(input => {
        input.addEventListener("change", e => {
            const sem = parseInt(e.target.dataset.sem);
            const val = parseInt(e.target.value);
            if (val >= 8 && val <= 36) {
                perSemesterSks[sem] = val;
            } else {
                delete perSemesterSks[sem];
                e.target.value = maxSks;
            }
            refreshPlan();
        });
    });

    // Restore scroll position + refocus the input the user was editing.
    if (scroller) scroller.scrollTop = scrollTop;
    if (winScrollY) window.scrollTo(0, winScrollY);
    if (focusedSem) {
        const next = planArea.querySelector(`.sem-sks-cap[data-sem="${focusedSem}"]`);
        if (next) next.focus({ preventScroll: true });
    }
}

// ──────────────────────────────────────────────
// Graph Visualization (Tab 2)
// ──────────────────────────────────────────────
let network = null;
let subgraphNetwork = null;

function themeColors() {
    const s = getComputedStyle(document.documentElement);
    const v = (name, fallback) => (s.getPropertyValue(name).trim() || fallback);
    return {
        depth: [
            v("--graph-d0", "#a6e3a1"),
            v("--graph-d1", "#89b4fa"),
            v("--graph-d2", "#cba6f7"),
            v("--graph-d3", "#f38ba8"),
            v("--graph-d4", "#fab387"),
            v("--graph-d5", "#f9e2af"),
            v("--graph-d6", "#94e2d5"),
            v("--graph-d7", "#f2cdcd"),
        ],
        done: v("--graph-done", "#45475a"),
        prereq: v("--graph-prereq", "#585b70"),
        edge: v("--graph-edge", "#585b70"),
        edgeHi: v("--graph-edge-hi", "#f9e2af"),
        nodeBorder: v("--graph-node-border", "#585b70"),
        nodeBorderDone: v("--graph-node-border-done", "#6c7086"),
        nodeHi: v("--graph-node-hi", "#f9e2af"),
        nodeHiBorder: v("--graph-node-hi-border", "#fab387"),
        nodeText: v("--graph-node-text", "#1e1e2e"),
        nodeTextDone: v("--graph-node-text-done", "#a6adc8"),
        tooltipBg: v("--graph-tooltip-bg", "#1e1e2e"),
        tooltipBorder: v("--graph-tooltip-border", "#45475a"),
        tooltipTitle: v("--graph-tooltip-title", "#f9e2af"),
        tooltipText: v("--graph-tooltip-text", "#cdd6f4"),
        tooltipMeta: v("--graph-tooltip-meta", "#89b4fa"),
        tooltipMuted: v("--graph-tooltip-muted", "#a6adc8"),
        center: v("--graph-center", "#f9e2af"),
        ancestor: v("--graph-ancestor", "#89b4fa"),
        descendant: v("--graph-descendant", "#a6e3a1"),
    };
}

async function loadGraph() {
    const container = document.getElementById("graph-container");
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading graph...</div>';

    let data;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`/api/graph?track=${currentTrack}`, { signal: controller.signal });
        clearTimeout(timeout);
        data = await res.json();
    } catch (err) {
        container.innerHTML = `<div class="banner warning">Graph fetch failed: ${err.message}</div>`;
        return;
    }

    if (!data.nodes || !data.edges) {
        container.innerHTML = `<div class="banner warning">API error: ${JSON.stringify(data)}</div>`;
        return;
    }

    // Clear spinner now — all errors below will be shown in container
    container.innerHTML = "";

    try {

    const T = themeColors();
    const depthColors = T.depth;

    // Calculate depth via BFS — O(V+E) with adjacency list
    const inDeg = {};
    const adjList = {};
    data.nodes.forEach(n => { inDeg[n.id] = 0; adjList[n.id] = []; });
    data.edges.forEach(e => {
        if (inDeg[e.to] !== undefined) inDeg[e.to]++;
        if (adjList[e.from]) adjList[e.from].push(e.to);
    });

    const depth = {};
    const queue = Object.keys(inDeg).filter(k => inDeg[k] === 0);
    queue.forEach(k => depth[k] = 0);
    let qi = 0;
    while (qi < queue.length) {
        const node = queue[qi++];
        for (const to of adjList[node]) {
            depth[to] = Math.max(depth[to] || 0, (depth[node] || 0) + 1);
            inDeg[to]--;
            if (inDeg[to] === 0) queue.push(to);
        }
    }

    // Assign x/y from depth — no physics needed
    const depthGroups = {};
    data.nodes.forEach(n => {
        const d = depth[n.id] || 0;
        if (!depthGroups[d]) depthGroups[d] = [];
        depthGroups[d].push(n.id);
    });
    const positions = {};
    const xSpacing = 200, ySpacing = 160;
    Object.entries(depthGroups).forEach(([d, ids]) => {
        const totalW = (ids.length - 1) * xSpacing;
        ids.forEach((id, i) => {
            positions[id] = { x: i * xSpacing - totalW / 2, y: parseInt(d) * ySpacing };
        });
    });

    const nodes = new vis.DataSet(data.nodes.map(n => {
        const d = depth[n.id] || 0;
        let bg = depthColors[Math.min(d, depthColors.length - 1)];
        const isDone = completed.has(n.id);
        const isPrereq = currentTrack !== "all" && !n.is_track;

        if (isDone) bg = T.done;
        else if (isPrereq) bg = T.prereq;

        const tooltip = document.createElement("div");
        tooltip.style.cssText = `padding:10px 14px;background:${T.tooltipBg};border:1px solid ${T.tooltipBorder};border-radius:8px;font-family:'Geist Mono',monospace;font-size:12px;max-width:280px;line-height:1.65;box-shadow:0 12px 32px -8px rgba(0,0,0,0.35)`;
        tooltip.innerHTML = `<b style="color:${T.tooltipTitle}">${n.id}</b><br>
            <span style="color:${T.tooltipText}">${n.name}</span><br>
            <span style="color:${T.tooltipMeta}">${n.sks} SKS · ${n.tracks ? n.tracks.join(", ") : ""}</span><br>
            <span style="color:${T.tooltipMuted}">Prereqs: ${n.prerequisites && n.prerequisites.length ? n.prerequisites.join(", ") : "None"}</span>`;

        return {
            id: n.id,
            label: n.id,
            title: tooltip,
            shape: "box",
            color: {
                background: bg,
                border: isDone ? T.nodeBorderDone : T.nodeBorder,
                highlight: { background: T.nodeHi, border: T.nodeHiBorder },
                hover: { background: bg, border: T.nodeHi },
            },
            font: { color: isDone ? T.nodeTextDone : T.nodeText, size: 11, face: "Geist Mono, monospace" },
            margin: 8,
            borderWidth: 1,
            borderWidthSelected: 2,
            shapeProperties: { borderRadius: 6 },
            x: positions[n.id].x,
            y: positions[n.id].y,
            fixed: true,
        };
    }));

    const edges = new vis.DataSet(data.edges.map(e => ({
        from: e.from,
        to: e.to,
        arrows: { to: { enabled: true, scaleFactor: 0.6 } },
        color: { color: T.edge, highlight: T.edgeHi, hover: T.edgeHi },
        width: 1,
        smooth: { type: "cubicBezier", forceDirection: "vertical", roundness: 0.4 },
    })));

    if (network) { network.destroy(); network = null; }
    network = new vis.Network(container, { nodes, edges }, {
        physics: { enabled: false },
        interaction: { hover: true, tooltipDelay: 100, dragNodes: false },
    });
    network.fit();

    } catch (err) {
        container.innerHTML = `<div class="banner warning">Graph error: ${err.message}<br><pre>${err.stack}</pre></div>`;
    }
}

// ──────────────────────────────────────────────
// Course Query (Tab 3)
// ──────────────────────────────────────────────
function populateQuerySelector() {
    const select = document.getElementById("query-select");
    select.innerHTML = '<option value="">Select a course...</option>';
    const sorted = [...allCourses].sort((a, b) => a.code.localeCompare(b.code));
    for (const c of sorted) {
        select.innerHTML += `<option value="${c.code}">${c.code}: ${c.name}</option>`;
    }
    select.addEventListener("change", onQueryChange);
}

async function onQueryChange() {
    const code = document.getElementById("query-select").value;
    const area = document.getElementById("query-area");

    if (!code) {
        area.innerHTML = '<div class="banner info">Select a course above to analyze its prerequisites and unlocks.</div>';
        return;
    }

    area.innerHTML = '<div class="loading"><div class="spinner"></div>Analyzing...</div>';

    const course = allCourses.find(c => c.code === code);
    const [ancestorRes, descendantRes] = await Promise.all([
        fetch(`/api/ancestors/${code}`).then(r => r.json()),
        fetch(`/api/descendants/${code}`).then(r => r.json()),
    ]);

    const trackBadges = (course.tracks || [])
        .map(t => `<span class="track-badge">${allTracks[t] || t}</span>`)
        .join(" ");

    let html = `<div class="course-info-card">
        <h3>${course.code}: ${course.name}</h3>
        <div class="course-meta">
            <span><strong>SKS:</strong> ${course.sks}</span>
            <span><strong>Semester:</strong> ${course.semester_type}</span>
            <span><strong>Direct Prereqs:</strong> ${course.prerequisites.join(", ") || "None"}</span>
        </div>
        ${trackBadges ? `<div style="margin-top:8px">${trackBadges}</div>` : ""}
    </div>`;

    html += `<div class="query-grid">`;

    // Ancestors
    html += `<div class="query-panel">
        <h4>All Prerequisites (Ancestors)</h4>
        <div class="panel-desc">Found via <strong>Reverse BFS</strong> on the prerequisite graph.</div>`;
    if (ancestorRes.ancestors.length > 0) {
        html += `<div class="query-stat">${ancestorRes.ancestors.length} courses · ${ancestorRes.total_sks} SKS</div>`;
        html += `<div class="query-items">`;
        for (const a of ancestorRes.ancestors) {
            html += `<span class="query-item ancestor">${a.code}: ${a.name} (${a.sks} SKS)</span>`;
        }
        html += `</div>`;
    } else {
        html += `<div class="banner success">No prerequisites! Starter course 🚀</div>`;
    }
    html += `</div>`;

    // Descendants
    html += `<div class="query-panel">
        <h4>All Unlocks (Descendants)</h4>
        <div class="panel-desc">Found via <strong>Forward BFS</strong> on the dependency graph.</div>`;
    if (descendantRes.descendants.length > 0) {
        html += `<div class="query-stat">${descendantRes.descendants.length} courses · ${descendantRes.total_sks} SKS unlocked</div>`;
        html += `<div class="query-items">`;
        for (const d of descendantRes.descendants) {
            html += `<span class="query-item descendant">${d.code}: ${d.name} (${d.sks} SKS)</span>`;
        }
        html += `</div>`;
    } else {
        html += `<div class="banner info">Terminal course - nothing depends on it.</div>`;
    }
    html += `</div></div>`;

    // Subgraph
    const TC = themeColors();
    html += `<h4 style="margin-top:24px">Dependency subgraph</h4>`;
    html += `<div id="subgraph-container"></div>`;
    html += `<div class="legend">
        <span><span class="legend-dot" style="background:${TC.center}"></span> Selected</span>
        <span><span class="legend-dot" style="background:${TC.ancestor}"></span> Prerequisites</span>
        <span><span class="legend-dot" style="background:${TC.descendant}"></span> Unlocked</span>
    </div>`;

    area.innerHTML = html;

    // Render subgraph
    renderSubgraph(code, ancestorRes.ancestors, descendantRes.descendants);
}

function renderSubgraph(centerCode, ancestors, descendants) {
    const container = document.getElementById("subgraph-container");
    if (!container) return;

    const ancestorCodes = new Set(ancestors.map(a => a.code));
    const descendantCodes = new Set(descendants.map(d => d.code));
    const allCodes = new Set([centerCode, ...ancestorCodes, ...descendantCodes]);

    const nodeData = [];
    for (const code of allCodes) {
        const c = allCourses.find(x => x.code === code);
        if (!c) continue;

        const T = themeColors();
        let color, size;
        if (code === centerCode) { color = T.center; size = 28; }
        else if (ancestorCodes.has(code)) { color = T.ancestor; size = 18; }
        else { color = T.descendant; size = 18; }

        nodeData.push({
            id: code,
            label: `${code}\n${c.name}`,
            color: { background: color, border: color },
            font: { color: T.nodeText, size: 11, face: "Geist Mono, monospace" },
            size,
        });
    }

    const TE = themeColors();
    const edgeData = [];
    for (const c of allCourses) {
        if (!allCodes.has(c.code)) continue;
        for (const prereq of c.prerequisites) {
            if (allCodes.has(prereq)) {
                edgeData.push({ from: prereq, to: c.code, arrows: "to", color: { color: TE.edge }, width: 1.5 });
            }
        }
    }

    if (subgraphNetwork) {
        subgraphNetwork.destroy();
        subgraphNetwork = null;
    }
    subgraphNetwork = new vis.Network(container,
        { nodes: new vis.DataSet(nodeData), edges: new vis.DataSet(edgeData) },
        {
            physics: {
                barnesHut: { gravitationalConstant: -2000 },
                stabilization: { iterations: 80, fit: true },
            },
            interaction: { hover: true },
        }
    );
    subgraphNetwork.on("stabilizationIterationsDone", () => {
        subgraphNetwork.setOptions({ physics: false });
    });
}
