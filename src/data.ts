/**
 * Content lifted directly from ecpectation_web.jsx. Treated as the source of
 * truth — the MCP `show_portfolio` tool ships this same data in
 * `structuredContent` so a non-UI host can still answer "what's in Ikkyu's
 * portfolio?" in plain text.
 *
 * Anything ADDED here beyond the original source file should remain verifiable
 * (the spec is explicit about not fabricating metrics).
 */

export interface Stat { n: string; l: string; }
export interface CareerEntry {
  id: string;       // Stable slug for deep-linking
  y: string;        // Year range as it should display
  t: string;        // Role title
  c: string;        // Company
  d: string;        // Description (used for the expanded panel)
  hi?: boolean;     // Currently-highlighted role
  tech?: string[];  // Parsed tech badges for the expanded panel
  related?: string[]; // Project IDs to link from the expanded panel
}
export interface Project {
  id: string;       // Stable slug for deep-linking
  n: string;        // Display name
  u: string;        // Live URL
  tag: string;      // Domain tag
  d: string;        // Short description
  /** Drill-down detail panels. All optional — modal renders what's present. */
  problem?: string;
  approach?: string;
  result?: string;
  tech?: string[];
  source?: string;  // Optional source-code URL
  docs?: string;    // Optional docs/architecture URL
}
export interface Domain { i: string; l: string; d: string; }
export interface SkillCategory { c: string; s: string[]; }
export interface SideProject { n: string; s: string; d: string; u: string | null; }

export const STATS: Stat[] = [
  { n: "29", l: "Live" },
  { n: "50", l: "Projects" },
  { n: "47", l: "Workers" },
  { n: "9", l: "Industries" },
];

export const CAREER: CareerEntry[] = [
  {
    id: "bks-2025",
    y: "2025–Now",
    t: "Associate Solution Architect",
    c: "Bangkok Silicon (BKS)",
    d: "AI/ML consulting, government digital transformation, BIM agentic frameworks, DDPM disaster platforms, Royal Rainmaking AI, hospitality intelligence.",
    hi: true,
    tech: ["LangGraph", "Claude Sonnet", "MCP", "PINNs", "FastAPI", "Next.js"],
    related: ["carbonbim", "earthcast", "ndwc", "gdas", "rainmaking"],
  },
  {
    id: "libralytics-2024",
    y: "2024–Now",
    t: "Lead Data & AI Engineer",
    c: "Libralytics (Freelance)",
    d: "AI agents for restaurant marketing, MLOps (Docker/K8s), full-stack pipelines, FastAPI, Apache Airflow, Next.js.",
    tech: ["Docker", "K8s", "FastAPI", "Airflow", "Next.js"],
    related: ["bitebase"],
  },
  {
    id: "freelance-cfd-2019",
    y: "2019–Now",
    t: "CFD/FEA Specialist",
    c: "Freelance (7+ years)",
    d: "ANSYS Fluent/CFX, COMSOL, OpenFOAM, Moldex3D. Aerodynamics, turbomachinery, HVAC, multiphase flows, heat transfer.",
    tech: ["ANSYS Fluent", "COMSOL", "OpenFOAM", "Moldex3D", "CFD", "FEA"],
  },
  {
    id: "tipco-2025",
    y: "2025",
    t: "Data Engineer",
    c: "Tipco Asphalt",
    d: "Azure Data Factory, Synapse Analytics, Oracle-to-cloud migration, LLM integration.",
    tech: ["Azure", "Synapse", "Oracle"],
  },
  {
    id: "qchang-2023",
    y: "2023",
    t: "Service Dev Specialist",
    c: "Q-CHANG",
    d: "SOPs, GMV forecasting (regression), Python sentiment analysis, supplier management.",
    tech: ["Python", "Pandas"],
  },
  {
    id: "cp-2022",
    y: "2022–23",
    t: "Future Leader (FLP 12)",
    c: "Charoen Pokphand Group",
    d: "24-cavity mold → 300K pcs/day. +2.9M Baht sales. Power BI. Reported to CP Shareman Executive.",
    tech: ["Power BI"],
  },
  {
    id: "tint-2021",
    y: "2021–22",
    t: "Nuclear Engineer",
    c: "Thailand Institute of Nuclear Technology",
    d: "Radiopharmaceutical production (I-131). ISO 9001, GMP. Data science for preventive maintenance.",
    tech: ["Python", "Pandas"],
  },
  {
    id: "hitachi-2021",
    y: "2021",
    t: "Mechanical Design Engineer",
    c: "Arçelik Hitachi",
    d: "ANSYS & Moldex3D stress/fatigue analysis. Prototype testing with Japanese lab. FBF640→720.",
    tech: ["ANSYS Fluent", "Moldex3D", "SolidWorks"],
  },
  {
    id: "macs-2019",
    y: "2019–21",
    t: "Mechanical Engineer",
    c: "MACS",
    d: "EPC at Bangchack Refinery. QC Welding (ASME IX). AutoCAD Plant 3D.",
    tech: ["AutoCAD"],
  },
];

export const PROJECTS: Project[] = [
  {
    id: "carbonbim",
    n: "CarbonBIM",
    u: "https://bim.getintheq.space",
    tag: "BIM+AI",
    d: "AI carbon calculator — IFC upload, 104+ TGO emission factors",
    problem: "Thai construction projects need EN 15978 lifecycle carbon assessments but TGO emission factors aren't bundled into BIM tools.",
    approach: "Browser-native IFC parser plus a LangGraph agent that maps element materials to a 104-row TGO factor table and assembles a stage-by-stage carbon report.",
    result: "Single-upload carbon report aligned to EN 15978 / EDGE / TREES — no desktop install required.",
    tech: ["Next.js", "LangGraph", "Claude Sonnet", "IFC", "FastAPI"],
  },
  {
    id: "earthcast",
    n: "EarthCast AI",
    u: "https://earthcast-ai.vercel.app",
    tag: "Earth",
    d: "AI weather forecast — PINNs + FourCastNet + CesiumJS",
    problem: "Global forecast models are accurate but the rendering pipeline is slow and rarely region-tuned for Southeast Asia.",
    approach: "Wrap FourCastNet inference with a thin PINN correction layer for the Thai gulf, push results to a CesiumJS globe with time-step slider.",
    result: "Interactive global forecast with sub-second region zoom and adjustable forecast horizon.",
    tech: ["FourCastNet", "PINNs", "CesiumJS", "Next.js"],
  },
  {
    id: "facility-manager",
    n: "Facility Manager",
    u: "https://facility-management-app-mocha.vercel.app",
    tag: "3D",
    d: "Full-stack building management with 3D viewer",
    problem: "Facility teams need real-time 3D visibility into floor plans, assets, and maintenance status without installing desktop BIM software.",
    approach: "xeokit WebGL renderer for IFC model display in the browser, Next.js full-stack with PostgreSQL for asset and maintenance records, real-time status overlays projected onto the 3D model.",
    result: "Zero-install 3D facility dashboard that eliminates the desktop BIM dependency for day-to-day operations teams.",
    tech: ["xeokit", "Three.js", "Next.js", "PostgreSQL"],
  },
  {
    id: "ndwc",
    n: "NDWC Smart Alert",
    u: "https://ndwc-smart-alert.vercel.app",
    tag: "Gov",
    d: "Thailand flood monitoring & AI water alerts",
    problem: "National Disaster Warning Centre needs per-province flood signals routed to LINE OA subscribers in near-real-time.",
    approach: "Stream NOAA GHCN-Daily + Thai Met data through a scoring pipeline; broadcast through LINE Messaging API.",
    result: "Province-level alerts with adjustable thresholds, deployed in front of the existing NDWC ops dashboard.",
    tech: ["FastAPI", "LINE OA", "Pandas", "Cloudflare Workers"],
  },
  {
    id: "gdas",
    n: "GDAS Disaster",
    u: "https://gdas-ai-disaster-watch.vercel.app",
    tag: "Gov",
    d: "DDPM multi-hazard early warning (14 types, CAP v1.2)",
    problem: "Thailand's DDPM needed a single operator dashboard covering 14 hazard types — floods, earthquakes, storms, landslides — with alert output conforming to the CAP v1.2 international standard for downstream integrations.",
    approach: "FastAPI backend normalising 14 hazard data feeds into a unified CAP v1.2 schema, Cloudflare Workers distributing low-latency alerts, Next.js dashboard for DDPM operators with per-hazard status maps.",
    result: "Multi-hazard early warning platform aligned to CAP v1.2, enabling DDPM to route structured alerts to partner systems without custom per-hazard adapters.",
    tech: ["CAP v1.2", "Next.js", "FastAPI", "Cloudflare Workers"],
  },
  {
    id: "nt-facility",
    n: "NT Facility 3D",
    u: "https://nt-facility-3-d-manager-new-ui.vercel.app",
    tag: "Telecom",
    d: "National Telecom 3D facility (xeokit/Three.js)",
    problem: "National Telecom Thailand needed real-time 3D visibility into their nationwide facility and equipment infrastructure for asset tracking and maintenance scheduling.",
    approach: "xeokit WebGL renderer adapted for telecom equipment taxonomy (towers, racks, cabling), with asset metadata overlays, spatial filtering by region, and a maintenance-event timeline sidebar.",
    result: "3D facility management system giving NT's infrastructure team browser-based asset visibility across multiple sites without a GIS or CAD desktop dependency.",
    tech: ["xeokit", "Three.js", "Next.js"],
  },
  {
    id: "rainmaking",
    n: "Rainmaking",
    u: "https://rainmaking-mission-planing-dashboard.vercel.app",
    tag: "Gov+AI",
    d: "Royal Rainmaking mission planning with PINNs",
    problem: "Royal Rainmaking Operations Division plans cloud-seeding missions from historical weather data but lacked computational tools to predict optimal seeding windows from atmospheric physics equations.",
    approach: "Physics-Informed Neural Networks (PINNs) via DeepXDE, constrained to atmospheric convection and moisture-flux equations, feeding probability scores into a mission-planning dashboard built in Next.js.",
    result: "AI-augmented mission planning dashboard integrating PINN atmospheric forecasts into the Royal Rainmaking daily operational workflow.",
    tech: ["PINNs", "DeepXDE", "Next.js"],
  },
  {
    id: "bim-companion",
    n: "BIM Companion",
    u: "https://bim-model-companion.vercel.app",
    tag: "BIM",
    d: "Browser-native IFC viewer with AI companion",
    problem: "BIM reviewers spend hours navigating large IFC models to answer simple questions — load-bearing walls, total glazing area on a given floor, MEP conflicts — that should take seconds.",
    approach: "Browser-native IFC parser (no server upload required) combined with Claude Sonnet as an AI companion that queries the parsed element data and answers natural-language questions grounded in the IFC schema.",
    result: "Zero-install BIM viewer where any reviewer can ask questions about a model in plain English and get element-level answers without opening Revit or a desktop BIM tool.",
    tech: ["IFC", "Three.js", "Claude Sonnet"],
  },
  {
    id: "scada-ai",
    n: "SCADA AI",
    u: "https://scada-ai.vercel.app",
    tag: "IoT",
    d: "Industrial IoT AI monitoring platform",
    problem: "Industrial facilities generate high-frequency sensor streams from PLCs and SCADA systems, but operators drown in false-positive alerts that mask genuine fault precursors.",
    approach: "FastAPI ingestion layer normalising multi-source sensor data, Pandas statistical anomaly detection with configurable sensitivity thresholds per sensor class, Next.js real-time dashboard surfacing ranked alerts.",
    result: "AI-augmented monitoring platform that separates process variation from genuine anomalies, reducing alert fatigue while keeping fault detection sensitivity high.",
    tech: ["FastAPI", "Pandas", "Next.js"],
  },
  {
    id: "farmbook",
    n: "Farmbook",
    u: "https://farmbook-dashboard.vercel.app",
    tag: "Gov",
    d: "Ministry of Agriculture data dashboard",
    problem: "Thailand's Ministry of Agriculture had crop registration, farmer records, and subsidy disbursement data spread across siloed provincial databases — no unified view for policy decisions.",
    approach: "ETL pipeline consolidating provincial records into a central store, Power BI embedded analytics for regional breakdowns, Next.js host with role-based access control for ministry and provincial staff.",
    result: "Unified agricultural data dashboard replacing ad-hoc spreadsheet reporting, giving ministry stakeholders province-level crop and subsidy visibility in a single interface.",
    tech: ["Next.js", "Power BI"],
  },
  {
    id: "bitebase",
    n: "BiteBase API",
    u: "https://api.bitebase.app",
    tag: "F&B",
    d: "Restaurant BI backend with AI agents",
    problem: "Restaurant groups on platforms like Wongnai and LINE MAN lack data infrastructure to run marketing campaigns informed by their own order history, customer segments, and competitive context.",
    approach: "LangGraph agent orchestrating marketing strategy generation from order analytics, FastAPI backend with PostgreSQL for customer and campaign data, Docker/K8s deployment for multi-tenant restaurant clients.",
    result: "Production BI backend serving restaurant clients with AI-generated marketing insights grounded in their actual transaction data.",
    tech: ["LangGraph", "FastAPI", "PostgreSQL", "Docker"],
  },
  {
    id: "pipeline-viz",
    n: "Pipeline Viz",
    u: "https://data-pipeline-visualizer.vercel.app",
    tag: "Data",
    d: "ETL pipeline visualization tool",
    problem: "Data engineers managing complex Airflow DAGs diagnose failures by reading Python DAG code and text logs — a slow process when a dependency chain spans dozens of tasks.",
    approach: "Airflow REST API integration pulling DAG structure and run history, rendered as an interactive node-link graph in Next.js with failure-state highlighting and upstream lineage tracing on hover.",
    result: "Visual pipeline inspector that surfaces dependency failures graphically, cutting mean time-to-diagnosis for broken DAGs versus log-file triage.",
    tech: ["Next.js", "Airflow"],
  },
];

export const DOMAINS: Domain[] = [
  { i: "◆", l: "BIM & Construction", d: "IFC, EN 15978, TGO, EDGE, TREES, BOQ-to-cost" },
  { i: "◇", l: "Weather & Earth Science", d: "FourCastNet, PINNs, GFS, CesiumJS, NOAA" },
  { i: "▣", l: "Thai Government", d: "DDPM, TPQI, NSDF, NDWC, Rainmaking, AOT" },
  { i: "△", l: "Hospitality & F&B", d: "BiteBase, HotelCSI, Wongnai, LINE MAN" },
  { i: "○", l: "Engineering Simulation", d: "ANSYS, COMSOL, OpenFOAM, DeepXDE, Moldex3D" },
  { i: "□", l: "Healthcare", d: "FHIR R4, Thai NLP, LINE OA, lab analysis" },
];

export const SKILLS: SkillCategory[] = [
  { c: "AI / Agents", s: ["LangGraph", "Claude Sonnet", "Qwen3", "MCP", "A2A", "Huggingface", "Typhoon", "PINNs", "DeepXDE"] },
  { c: "Full-Stack", s: ["Next.js", "React", "TypeScript", "Tailwind", "FastAPI", "Express", "shadcn/ui"] },
  { c: "Data / Cloud", s: ["PostgreSQL", "MongoDB", "Azure", "Airflow", "Docker", "K8s", "Pandas", "Power BI", "Tableau"] },
  { c: "Engineering", s: ["ANSYS Fluent", "COMSOL", "OpenFOAM", "Moldex3D", "SolidWorks", "AutoCAD", "CFD", "FEA"] },
  { c: "Platforms", s: ["Vercel", "Cloudflare Workers", "Supabase", "LINE OA", "Postman", "Git", "LangSmith"] },
];

export const SIDE_PROJECTS: SideProject[] = [
  {
    n: "kidpen.org",
    s: "Free STEM Education for Thailand",
    d: "Open-source STEM platform for Thai students (ม.1+), inspired by Brilliant.org. Next.js, FastAPI, Qwen3. AI tutor mascot Ping.",
    u: "https://kidpen.org",
  },
  {
    n: "CarbonScope",
    s: "Embodied Carbon Intelligence",
    d: "Thai construction sustainability platform. EN 15978 lifecycle carbon, TGO emission factors, EDGE/TREES certification.",
    u: "https://bim.getintheq.space",
  },
  {
    n: "FloodSight",
    s: "Province-Level Flood Risk Scoring",
    d: "ZerveHack 2026 (Climate & Energy). NOAA GHCN-Daily + NVIDIA FourCastNet. Thai Flood Risk Score for 77 provinces.",
    u: null,
  },
];

export const SOCIALS = [
  { l: "G", u: "https://github.com/getintheQ", t: "GitHub" },
  { l: "in", u: "https://linkedin.com/in/getintheq", t: "LinkedIn" },
  { l: "@", u: "mailto:kiw.brw@gmail.com", t: "Email" },
  { l: "↗", u: "https://www.khiw.dev/api/resume", t: "Resume" },
] as const;
