"""
Curriculum Data - Teknik Informatika ITS (Kurikulum 2023)
Source: ITS Academic Website
Prerequisites based on Kurikulum 2025 prerequisite list.

Tracks:
  core     - Mandatory foundation courses (Sem 1-4)
  ai_ml    - AI & Machine Learning
  cysec    - Cybersecurity
  network  - Networking & Distributed Systems
  software - Software Engineering
  game     - Game Development
  data     - Data Science & Applied Math
  database - Database & Information Systems
"""

from graph_engine import Course

SAMPLE_CURRICULUM = [
    # ══════════════════════════════════════════════
    # SEMESTER 1 (No prerequisites) — all required
    # ══════════════════════════════════════════════
    Course("EF234103", "Aljabar Linier", 3, "ganjil", tracks=["core", "data"]),
    Course("EF234101", "Dasar Pemrograman", 4, "ganjil", tracks=["core"]),
    Course("SM234101", "Kalkulus 1", 3, "ganjil", tracks=["core", "data"]),
    Course("EF234104", "Sistem Basis Data", 4, "ganjil", tracks=["core", "database"]),
    Course("EF234102", "Sistem Digital", 3, "ganjil", tracks=["core"]),

    # ══════════════════════════════════════════════
    # SEMESTER 2 — all required
    # ══════════════════════════════════════════════
    Course("SM234201", "Kalkulus 2", 3, "genap", ["SM234101"], tracks=["core", "data"]),
    Course("EF234204", "Komputasi Numerik", 3, "genap", ["EF234103"], tracks=["core", "data"]),
    Course("EF234203", "Organisasi Komputer", 3, "genap", ["EF234102"], tracks=["core", "cysec"]),
    Course("EE234101", "Pengantar Teknologi Elektro dan Informatika Cerdas", 2, "genap", tracks=["core"]),
    Course("EF234202", "Sistem Operasi", 4, "genap", ["EF234102"], tracks=["core", "cysec"]),
    Course("EF234201", "Struktur Data", 4, "genap", ["EF234101"], tracks=["core"]),

    # ══════════════════════════════════════════════
    # SEMESTER 3 — all required
    # ══════════════════════════════════════════════
    Course("EF234303", "Jaringan Komputer", 4, "ganjil", ["EF234202"], tracks=["core", "network", "cysec"]),
    Course("EK234201", "Konsep Kecerdasan Artifisial", 3, "ganjil", ["EF234201"], tracks=["core", "ai_ml"]),
    Course("EF234307", "Konsep Pengembangan Perangkat Lunak", 2, "ganjil", tracks=["core", "software"]),
    Course("EF234305", "Matematika Diskrit", 3, "ganjil", ["SM234201"], tracks=["core", "data"]),
    Course("EF234302", "Pemrograman Berorientasi Objek", 3, "ganjil", ["EF234201"], tracks=["core", "software", "game"]),
    Course("EF234301", "Pemrograman Web", 3, "ganjil", ["EF234104"], tracks=["core", "software"]),
    Course("EF234304", "Teori Graf", 3, "ganjil", ["SM234201"], tracks=["core", "data"]),

    # ══════════════════════════════════════════════
    # SEMESTER 4 — all required
    # ══════════════════════════════════════════════
    Course("EF234404", "Manajemen Basis Data", 3, "genap", ["EF234104"], tracks=["core", "database"]),
    Course("EF234403", "Otomata", 2, "genap", ["SM234201"], tracks=["core"]),
    Course("EF234406", "Pembelajaran Mesin", 3, "genap", ["EK234201"], tracks=["core", "ai_ml", "data"]),
    Course("EF234401", "Pemrograman Jaringan", 3, "genap", ["EF234303"], tracks=["core", "network"]),
    Course("EF234405", "Perancangan dan Analisis Algoritma", 3, "genap", ["EF234201"], tracks=["core", "data"]),
    Course("ER234301", "Perancangan Perangkat Lunak", 3, "genap", ["EF234307"], tracks=["core", "software"]),
    Course("EF234402", "Probabilitas dan Statistik", 3, "genap", ["EF234305"], tracks=["core", "data", "ai_ml"]),

    # ══════════════════════════════════════════════
    # SEMESTER 5 — all elective (required=False)
    # ══════════════════════════════════════════════
    Course("EF234518", "Data Mining", 3, "ganjil", ["EF234406"], tracks=["ai_ml", "data"], required=False),
    Course("EF234504", "Grafika Komputer", 3, "ganjil", ["EF234302"], tracks=["game"], required=False),
    Course("EF234507", "Jaringan Nirkabel", 3, "ganjil", ["EF234303"], tracks=["network"], required=False),
    Course("EF234502", "Keamanan Informasi", 3, "ganjil", ["EF234303"], tracks=["cysec"], required=False),
    Course("EF234503", "Pemodelan dan Simulasi", 3, "ganjil", ["EF234402"], tracks=["data"], required=False),
    Course("EF234501", "Pemrograman Berbasis Kerangka Kerja", 3, "ganjil", ["EF234302"], tracks=["software"], required=False),
    Course("EF234509", "Pemrograman Kompetitif", 3, "ganjil", tracks=["data"], required=False),
    Course("EF234505", "Rekayasa Sistem Berbasis Pengetahuan", 3, "ganjil", ["EF234404"], tracks=["ai_ml", "database"], required=False),
    Course("EF234510", "Riset Operasi", 3, "ganjil", tracks=["data"], required=False),
    Course("EF234513", "Sistem Enterprise", 3, "ganjil", ["EF234404"], tracks=["database"], required=False),
    Course("EF234508", "Sistem Terdistribusi", 3, "ganjil", tracks=["network"], required=False),
    Course("EF234514", "Tata Kelola Teknologi Informasi", 3, "ganjil", ["EF234404"], tracks=["database"], required=False),
    Course("EF234506", "Teknologi antar Jaringan", 3, "ganjil", ["EF234303"], tracks=["network"], required=False),
    Course("EF234517", "Pengolahan Citra dan Visi Komputer", 3, "ganjil", ["EF234406"], tracks=["ai_ml"], required=False),
    Course("EF234511", "Teknik Pengembangan Game", 3, "ganjil", tracks=["game"], required=False),
    Course("EF234515", "Rekayasa Kebutuhan", 3, "ganjil", tracks=["software"], required=False),
    Course("EF234512", "Manajemen Proyek Perangkat Lunak", 3, "ganjil", tracks=["software"], required=False),

    # ══════════════════════════════════════════════
    # SEMESTER 6 — all elective (required=False)
    # ══════════════════════════════════════════════
    Course("EF234615", "Audit Sistem", 3, "genap", ["EF234404"], tracks=["cysec", "database"], required=False),
    Course("EF234616", "Basis Data Terdistribusi", 3, "genap", ["EF234404"], tracks=["database", "network"], required=False),
    Course("EF234605", "Capstone Project", 3, "genap", tracks=["software"], required=False),
    Course("EF234619", "Deep Learning", 3, "genap", ["EF234406"], tracks=["ai_ml"], required=False),
    Course("EF234614", "Desain Pengalaman Pengguna", 3, "genap", tracks=["software"], required=False),
    Course("EF234602", "Interaksi Manusia dan Komputer", 3, "genap", ["EF234302"], tracks=["software", "game"], required=False),
    Course("EF234607", "Keamanan Aplikasi", 3, "genap", ["EF234202", "EF234203"], tracks=["cysec"], required=False),
    Course("EF234606", "Keamanan Jaringan", 3, "genap", ["EF234303"], tracks=["cysec", "network"], required=False),
    Course("EF234604", "Komputasi Bergerak", 3, "genap", ["EF234303"], tracks=["network"], required=False),
    Course("EF234625", "Komputasi Pervasif dan Jaringan Sensor", 3, "genap", ["EF234303"], tracks=["network"], required=False),
    Course("ER234402", "Konstruksi Perangkat Lunak", 3, "genap", ["ER234301"], tracks=["software"], required=False),
    Course("ER234503", "Kualitas Perangkat Lunak", 3, "genap", ["ER234301"], tracks=["software"], required=False),
    Course("EF234608", "Pemrograman Berbasis Antarmuka", 3, "genap", ["EF234301"], tracks=["software"], required=False),
    Course("EF234601", "Pemrograman Perangkat Bergerak", 3, "genap", ["EF234302"], tracks=["software"], required=False),
    Course("EF234610", "Simulasi Berbasis Agen", 3, "genap", ["EF234503"], tracks=["data"], required=False),
    Course("EF234609", "Simulasi Sistem Dinamis", 3, "genap", ["EF234503"], tracks=["data"], required=False),
    Course("EF234613", "Game Edukasi dan Simulasi", 3, "genap", tracks=["game"], required=False),
    Course("EF234618", "Game Engine", 3, "genap", tracks=["game"], required=False),
    Course("EF234617", "Sistem Informasi Geografis", 3, "genap", tracks=["database"], required=False),
    Course("EF234611", "Teknik Peramalan", 3, "genap", tracks=["data"], required=False),
    Course("EK234501", "Text Mining", 3, "genap", tracks=["ai_ml", "data"], required=False),
    Course("EF234612", "Animasi Komputer dan Pemodelan 3D", 3, "genap", tracks=["game"], required=False),

    # ══════════════════════════════════════════════
    # SEMESTER 7 — mixed: 2 required, rest elective
    # ══════════════════════════════════════════════
    Course("EF234708", "Analisis Data Multivariat", 3, "ganjil", ["EF234402"], tracks=["data", "ai_ml"], required=False),
    Course("ER234403", "Arsitektur Perangkat Lunak", 3, "ganjil", ["ER234301"], tracks=["software"], required=False),
    Course("EF234712", "Big Data", 3, "ganjil", ["EF234404"], tracks=["data", "database"], required=False),
    Course("EF234701", "Etika Profesi", 2, "ganjil", tracks=["core"]),
    Course("ER234505", "Evolusi Perangkat Lunak", 3, "ganjil", ["ER234301"], tracks=["software"], required=False),
    Course("EF234705", "Forensik Digital", 3, "ganjil", ["EF234401"], tracks=["cysec"], required=False),
    Course("EF234710", "Game Cerdas", 3, "ganjil", tracks=["game", "ai_ml"], required=False),
    Course("EF234704", "Komputasi Awan", 3, "ganjil", tracks=["network"], required=False),
    Course("EF234713", "Komputasi Kuantum", 3, "ganjil", tracks=["data"], required=False),
    Course("EF234706", "Pemrograman Pengolahan Sinyal", 3, "ganjil", ["EF234405"], tracks=["data"], required=False),
    Course("EF234707", "Pemrograman Data Sains Terapan", 3, "ganjil", tracks=["data", "ai_ml"], required=False),
    Course("EF234702", "Proposal Tugas Akhir", 2, "ganjil", tracks=["core"]),
    Course("EF234711", "Realitas X", 3, "ganjil", ["EF234504"], tracks=["game"], required=False),
    Course("EF234726", "Robotika", 3, "ganjil", tracks=["ai_ml"], required=False),
    Course("EF234709", "Simulasi Berorientasi Obyek", 3, "ganjil", ["EF234503"], tracks=["data"], required=False),
    Course("EF234703", "Teknologi IoT", 3, "ganjil", tracks=["network"], required=False),

    # ══════════════════════════════════════════════
    # SEMESTER 8 — required
    # ══════════════════════════════════════════════
    Course("EF234801", "Tugas Akhir", 5, "genap", ["EF234702"], tracks=["core"]),
]


def load_curriculum():
    """Load and return the ITS Informatika curriculum as a list of Course objects."""
    return SAMPLE_CURRICULUM
