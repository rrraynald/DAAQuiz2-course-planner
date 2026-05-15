/* ──────────────────────────────────────────────
   Pathway — product tour
   Flash exposure on target, no overlay/dim.
   ────────────────────────────────────────────── */

const TOUR_STEPS = [
    {
        target: "#track-select",
        kicker: "Sidebar",
        title: "Choose your concentration",
        body: "Start here. Pick a focus track — AI/ML, Cybersecurity, Software Engineering, and more. Pathway filters the curriculum to only the courses relevant to your track, plus every prerequisite they depend on.",
        placement: "right",
        before: null,
    },
    {
        target: "#completed-list",
        kicker: "Sidebar",
        title: "Mark what you've passed",
        body: "Check off every course you've already completed. Pathway removes them from upcoming semesters instantly and recalculates which courses you are now eligible to take.",
        placement: "right",
        before: null,
    },
    {
        target: "#tab-plan",
        kicker: "Tab I",
        title: "Read your semester plan",
        body: "Kahn's algorithm arranges your remaining courses into valid semesters — prerequisites respected, SKS cap honoured. Gold chips are track courses; muted chips are prerequisites pulled in automatically. Adjust the Max SKS on any card to redistribute your load.",
        placement: "bottom",
        before: () => switchTab("tab-plan"),
    },
    {
        target: "#tab-graph",
        kicker: "Tab II",
        title: "Explore the prerequisite graph",
        body: "Every course is a node; edges point from prerequisite to dependent. Colour encodes curriculum depth — how early a course sits in the sequence. Hover any node for details. Filter by track to reduce the graph to a manageable subgraph.",
        placement: "bottom",
        before: () => switchTab("tab-graph"),
    },
    {
        target: "#tab-query",
        kicker: "Tab III",
        title: "Query a single course",
        body: "Select any course and Pathway runs two BFS traversals: backward to find every prerequisite you need, and forward to find every course it unlocks. A dependency subgraph renders below.",
        placement: "bottom",
        before: () => switchTab("tab-query"),
    },
];

function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const content = document.getElementById(tabId);
    if (btn) btn.classList.add("active");
    if (content) content.classList.add("active");
    if (tabId === "tab-graph" && typeof loadGraph === "function") loadGraph();
    if (tabId === "tab-query" && typeof onQueryChange === "function") onQueryChange();
}

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function buildTourDOM() {
    const flash = document.createElement("div");
    flash.id = "tour-flash";
    flash.setAttribute("aria-hidden", "true");

    const tooltip = document.createElement("div");
    tooltip.id = "tour-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.setAttribute("aria-label", "Product tour");
    tooltip.innerHTML = `
        <div class="tour-progress" id="tour-progress"></div>
        <div class="tour-body">
            <p class="tour-step-label" id="tour-step-label"></p>
            <h3 class="tour-title" id="tour-title"></h3>
            <p class="tour-text" id="tour-text"></p>
        </div>
        <div class="tour-footer">
            <button class="tour-btn tour-skip" id="tour-skip" type="button">Skip</button>
            <div class="tour-nav">
                <button class="tour-btn tour-back" id="tour-back" type="button" aria-label="Previous step">&#8592; Back</button>
                <button class="tour-btn tour-next" id="tour-next" type="button" aria-label="Next step">Next &#8594;</button>
            </div>
        </div>
    `;

    document.body.appendChild(flash);
    document.body.appendChild(tooltip);
    return { flash, tooltip };
}

let tourState = null;

function startTour() {
    if (tourState) return;

    // Always begin on Tab I (the plan tab) so the highlight reaches the right tabs.
    // The first two steps target the sidebar which is always visible.
    const { flash, tooltip } = buildTourDOM();
    let step = 0;
    let prevEl = null;
    let onKey;

    function teardown() {
        flash.remove();
        tooltip.remove();
        if (prevEl) prevEl.classList.remove("tour-target");
        document.removeEventListener("keydown", onKey);
        tourState = null;
    }

    function positionFlash(el) {
        const r = el.getBoundingClientRect();
        const pad = 8;
        const header = document.querySelector(".app-header");
        const headerBottom = header ? header.getBoundingClientRect().bottom : 0;

        const rawTop = r.top - pad;
        const top = Math.max(rawTop, headerBottom + 4);
        const topDelta = top - rawTop;

        flash.style.top    = top + "px";
        flash.style.left   = (r.left - pad) + "px";
        flash.style.width  = (r.width + pad * 2) + "px";
        flash.style.height = Math.max(0, r.height + pad * 2 - topDelta) + "px";

        flash.classList.remove("tour-flash-go");
        void flash.offsetWidth;
        flash.classList.add("tour-flash-go");
    }

    function positionTooltip(el) {
        const r = el.getBoundingClientRect();
        const TW = 360, TH = 230;
        const vw = window.innerWidth, vh = window.innerHeight;
        const s = TOUR_STEPS[step];
        let top, left;

        if (s.placement === "right") {
            top  = clamp(r.top + r.height / 2 - TH / 2, 16, vh - TH - 16);
            left = clamp(r.right + 18, 16, vw - TW - 16);
            if (r.right + 18 + TW > vw) {
                left = clamp(r.left - TW - 18, 16, vw - TW - 16);
            }
        } else {
            top  = clamp(r.bottom + 14, 16, vh - TH - 16);
            left = clamp(r.left + r.width / 2 - TW / 2, 16, vw - TW - 16);
            if (r.bottom + 14 + TH > vh) {
                top = clamp(r.top - TH - 14, 16, vh - TH - 16);
            }
        }

        tooltip.style.top  = top + "px";
        tooltip.style.left = left + "px";
    }

    function render(idx) {
        const s = TOUR_STEPS[idx];
        if (s.before) s.before();

        requestAnimationFrame(() => requestAnimationFrame(() => {
            const el = document.querySelector(s.target);
            if (!el) { goNext(); return; }

            if (prevEl) prevEl.classList.remove("tour-target");
            prevEl = el;
            el.classList.add("tour-target");
            el.scrollIntoView({ block: "nearest", behavior: "smooth" });

            setTimeout(() => {
                positionFlash(el);
                positionTooltip(el);

                document.getElementById("tour-step-label").textContent =
                    `${s.kicker} · Step ${idx + 1} of ${TOUR_STEPS.length}`;
                document.getElementById("tour-title").textContent = s.title;
                document.getElementById("tour-text").textContent = s.body;

                document.getElementById("tour-progress").innerHTML = TOUR_STEPS.map((_, i) =>
                    `<span class="tour-dot${i === idx ? " active" : ""}"></span>`
                ).join("");

                document.getElementById("tour-back").style.visibility = idx === 0 ? "hidden" : "visible";
                document.getElementById("tour-next").textContent = idx === TOUR_STEPS.length - 1 ? "Finish" : "Next →";

                tooltip.classList.add("tour-visible");
            }, 130);
        }));
    }

    function goNext() {
        if (step < TOUR_STEPS.length - 1) {
            tooltip.classList.remove("tour-visible");
            step++;
            render(step);
        } else {
            teardown();
        }
    }

    function goBack() {
        if (step > 0) {
            tooltip.classList.remove("tour-visible");
            step--;
            render(step);
        }
    }

    document.getElementById("tour-next").addEventListener("click", goNext);
    document.getElementById("tour-back").addEventListener("click", goBack);
    document.getElementById("tour-skip").addEventListener("click", teardown);

    onKey = function (e) {
        if (!tourState) return;
        if (e.key === "Escape") teardown();
        if (e.key === "ArrowRight") goNext();
        if (e.key === "ArrowLeft") goBack();
    };
    document.addEventListener("keydown", onKey);

    tourState = { teardown };
    render(step);
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("tour-trigger");
    if (btn) btn.addEventListener("click", startTour);
});
