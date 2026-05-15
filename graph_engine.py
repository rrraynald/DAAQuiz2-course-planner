from collections import deque, defaultdict
from typing import Optional


class Course:
    def __init__(self, code: str, name: str, sks: int, semester_type: str = "both",
                 prerequisites: list[str] = None, semester_num: int = 0,
                 tracks: list[str] = None, required: bool = True):

        self.code = code
        self.name = name
        self.sks = sks
        self.semester_type = semester_type
        self.prerequisites = prerequisites or []
        self.tracks = tracks or []
        self.required = required

        if semester_num == 0:
            try:
                self.semester_num = int(code[5]) if len(code) >= 6 else 99
            except (ValueError, IndexError):
                self.semester_num = 99
        else:
            self.semester_num = semester_num

    def __repr__(self):
        return f"{self.code} - {self.name} ({self.sks} SKS)"


class CurriculumGraph:
    def __init__(self):
        self.courses: dict[str, Course] = {}
        self.adj: dict[str, list[str]] = defaultdict(list)  
        self.rev_adj: dict[str, list[str]] = defaultdict(list)

    def add_course(self, course: Course):
        self.courses[course.code] = course
        for prereq in course.prerequisites:
            self.adj[prereq].append(course.code)
            self.rev_adj[course.code].append(prereq)

# 1. Cycle Detection (DFS-based)
    def detect_cycle(self) -> Optional[list[str]]:
        WHITE, GRAY, BLACK = 0, 1, 2
        color = {code: WHITE for code in self.courses}
        parent = {code: None for code in self.courses}

        def dfs(u):
            color[u] = GRAY
            for v in self.adj.get(u, []):
                if v not in color:
                    continue
                if color[v] == GRAY:
                    cycle = [v, u]
                    node = u
                    while node != v:
                        node = parent[node]
                        if node is None:
                            break
                        cycle.append(node)
                    cycle.reverse()
                    return cycle
                if color[v] == WHITE:
                    parent[v] = u
                    result = dfs(v)
                    if result:
                        return result
            color[u] = BLACK
            return None

        for code in self.courses:
            if color[code] == WHITE:
                result = dfs(code)
                if result:
                    return result
        return None

# 2. Topological Sort (Kahn's Algorithm / BFS)
    def topological_sort(self) -> Optional[list[str]]:
        in_degree = defaultdict(int)
        for code in self.courses:
            in_degree.setdefault(code, 0)
            for neighbor in self.adj.get(code, []):
                in_degree[neighbor] += 1

        queue = deque(sorted(
            [c for c in self.courses if in_degree[c] == 0],
            key=lambda c: self.courses[c].semester_num
        ))
        result = []

        while queue:
            node = queue.popleft()
            result.append(node)
            for neighbor in self.adj.get(node, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if len(result) != len(self.courses):
            return None  # Cycle detected
        return result

# 3. Semester Planner (Modified Kahn's with SKS cap)
    def plan_semesters(self, max_sks: int = 24, completed: set[str] = None,
                       filter_semester: str = "all",
                       include_electives: bool = False,
                       per_semester_sks: dict = None) -> list[list[str]]:

        if completed is None:
            completed = set()

        remaining = {
            c for c in self.courses
            if c not in completed and (include_electives or self.courses[c].required)
        }

        in_degree = defaultdict(int)
        for code in remaining:
            in_degree.setdefault(code, 0)
            for prereq in self.rev_adj.get(code, []):
                if prereq in remaining:
                    in_degree[code] += 1

        available = deque(sorted(
            [c for c in remaining if in_degree[c] == 0],
            key=lambda c: self.courses[c].semester_num
        ))
        semesters = []
        current_sem_num = 1
        output_sem_count = 0
        deferred = []

        while available or deferred:
            effective_max = (per_semester_sks or {}).get(output_sem_count + 1, max_sks)
            if current_sem_num >= 5:
                effective_max = 9999

            semester = []
            semester_sks = 0
            next_available = []
            overflow = []

            still_deferred = []
            for c in deferred:
                if self.courses[c].semester_num <= current_sem_num:
                    next_available.append(c)
                else:
                    still_deferred.append(c)
            deferred = still_deferred

            available = deque(sorted(
                list(available) + next_available,
                key=lambda c: self.courses[c].semester_num
            ))
            next_available = []

            if filter_semester == "ganjil":
                sem_type = "ganjil" if current_sem_num % 2 == 1 else "genap"
            elif filter_semester == "genap":
                sem_type = "genap" if current_sem_num % 2 == 1 else "ganjil"
            else:
                sem_type = None

            while available:
                course_code = available.popleft()
                course = self.courses[course_code]

                if course.semester_num > current_sem_num:
                    deferred.append(course_code)
                    continue

                if sem_type and course.semester_type != "both" and course.semester_type != sem_type:
                    overflow.append(course_code)
                    continue

                if semester_sks + course.sks <= effective_max:
                    semester.append(course_code)
                    semester_sks += course.sks
                else:
                    overflow.append(course_code)

            for code in semester:
                for neighbor in self.adj.get(code, []):
                    if neighbor in remaining:
                        in_degree[neighbor] -= 1
                        if in_degree[neighbor] == 0:
                            next_available.append(neighbor)

            if semester:
                output_sem_count += 1
                semesters.append(semester)

            available = deque(sorted(
                overflow + next_available,
                key=lambda c: self.courses[c].semester_num
            ))
            current_sem_num += 1

            if current_sem_num > len(self.courses) + 1:
                break

        return semesters

# 4. Ancestor Query (Reverse BFS)
    def get_ancestors(self, course_code: str) -> list[str]:

        if course_code not in self.courses:
            return []

        visited = set()
        queue = deque([course_code])
        ancestors = []

        while queue:
            node = queue.popleft()
            for prereq in self.rev_adj.get(node, []):
                if prereq not in visited:
                    visited.add(prereq)
                    ancestors.append(prereq)
                    queue.append(prereq)

        return ancestors


# 5. Descendant Query (Forward BFS)
    def get_descendants(self, course_code: str) -> list[str]:

        if course_code not in self.courses:
            return []

        visited = set()
        queue = deque([course_code])
        descendants = []

        while queue:
            node = queue.popleft()
            for child in self.adj.get(node, []):
                if child not in visited:
                    visited.add(child)
                    descendants.append(child)
                    queue.append(child)

        return descendants

# 6. Graph Data for Visualization
    def get_graph_data(self) -> tuple[list[dict], list[dict]]:
        nodes = []
        for code, course in self.courses.items():
            nodes.append({
                "id": code,
                "label": f"{code}\n{course.name}\n({course.sks} SKS)",
                "title": f"{course.name} ({course.sks} SKS)\nPrereqs: {', '.join(course.prerequisites) or 'None'}",
                "sks": course.sks,
                "semester_type": course.semester_type,
            })

        edges = []
        for source, targets in self.adj.items():
            for target in targets:
                if source in self.courses and target in self.courses:
                    edges.append({"from": source, "to": target})

        return nodes, edges

# 7. Track/Concentration Filtering
    def get_track_courses(self, track: str) -> set[str]:
        
        track_courses = {code for code, c in self.courses.items() if track in c.tracks}

        all_needed = set(track_courses)
        queue = deque(track_courses)
        while queue:
            node = queue.popleft()
            for prereq in self.rev_adj.get(node, []):
                if prereq not in all_needed:
                    all_needed.add(prereq)
                    queue.append(prereq)

        return all_needed

    def plan_track(self, track: str, max_sks: int = 24,
                   completed: set[str] = None,
                   filter_semester: str = "all",
                   per_semester_sks: dict = None) -> list[list[str]]:
        
        if completed is None:
            completed = set()

        track_courses = self.get_track_courses(track)
        required_courses = {code for code, c in self.courses.items() if c.required}
        remaining = (track_courses | required_courses) - completed

        in_degree = defaultdict(int)
        for code in remaining:
            in_degree.setdefault(code, 0)
            for prereq in self.rev_adj.get(code, []):
                if prereq in remaining:
                    in_degree[code] += 1

        available = deque(sorted(
            [c for c in remaining if in_degree[c] == 0],
            key=lambda c: self.courses[c].semester_num
        ))
        semesters = []
        current_sem_num = 1
        output_sem_count = 0
        deferred = []

        while available or deferred:
            effective_max = (per_semester_sks or {}).get(output_sem_count + 1, max_sks)
            if current_sem_num >= 5:
                effective_max = 9999

            semester = []
            semester_sks = 0
            overflow = []
            next_available = []

            still_deferred = []
            for c in deferred:
                if self.courses[c].semester_num <= current_sem_num:
                    next_available.append(c)
                else:
                    still_deferred.append(c)
            deferred = still_deferred

            available = deque(sorted(
                list(available) + next_available,
                key=lambda c: self.courses[c].semester_num
            ))
            next_available = []

            if filter_semester == "ganjil":
                sem_type = "ganjil" if current_sem_num % 2 == 1 else "genap"
            elif filter_semester == "genap":
                sem_type = "genap" if current_sem_num % 2 == 1 else "ganjil"
            else:
                sem_type = None

            while available:
                course_code = available.popleft()
                course = self.courses[course_code]

                if course.semester_num > current_sem_num:
                    deferred.append(course_code)
                    continue

                if sem_type and course.semester_type != "both" and course.semester_type != sem_type:
                    overflow.append(course_code)
                    continue

                if semester_sks + course.sks <= effective_max:
                    semester.append(course_code)
                    semester_sks += course.sks
                else:
                    overflow.append(course_code)

            for code in semester:
                for neighbor in self.adj.get(code, []):
                    if neighbor in remaining:
                        in_degree[neighbor] -= 1
                        if in_degree[neighbor] == 0:
                            next_available.append(neighbor)

            if semester:
                output_sem_count += 1
                semesters.append(semester)

            available = deque(sorted(
                overflow + next_available,
                key=lambda c: self.courses[c].semester_num
            ))
            current_sem_num += 1

            if current_sem_num > len(remaining) + 1:
                break

        return semesters

    def get_available_tracks(self) -> dict[str, str]:
        track_names = {
            "core": "Core (Wajib)",
            "ai_ml": "AI & Machine Learning",
            "cysec": "Cybersecurity",
            "network": "Networking",
            "software": "Software Engineering",
            "game": "Game Development",
            "data": "Data & Applied Math",
            "database": "Database & Information Systems",
        }
        available = {}
        for track_id, name in track_names.items():
            if any(track_id in c.tracks for c in self.courses.values()):
                available[track_id] = name
        return available
