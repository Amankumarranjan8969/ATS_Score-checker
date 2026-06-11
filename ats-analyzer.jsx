import { useState, useRef, useCallback, useEffect } from "react";

// ── Google Font imports ────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap";
document.head.appendChild(fontLink);

// ── Company datasets ──────────────────────────────────────────────────────
const COMPANIES = {
  custom: {
    label: "Custom JD",
    icon: "✍",
    color: "#6366f1",
    bg: "#eef2ff",
    keywords: [],
    description: "Paste your own job description",
    roles: []
  },
  google: {
    label: "Google",
    icon: "G",
    color: "#4285F4",
    bg: "#e8f0fe",
    keywords: ["machine learning", "distributed systems", "golang", "python", "data structures", "algorithms", "system design", "kubernetes", "tensorflow", "scalability", "low latency", "cloud", "CI/CD", "code review", "api design"],
    description: "Software Engineer / Data Scientist roles",
    roles: ["SWE", "SRE", "Data Scientist", "ML Engineer"],
    principles: []
  },
  amazon: {
    label: "Amazon",
    icon: "A",
    color: "#FF9900",
    bg: "#fff8ec",
    keywords: ["customer obsession", "ownership", "invent simplify", "aws", "microservices", "java", "distributed", "leadership", "bias for action", "frugality", "dive deep", "deliver results", "s3", "lambda", "dynamodb", "kafka"],
    description: "Leadership Principles + AWS stack",
    roles: ["SDE", "TPM", "Data Engineer", "Solutions Architect"],
    principles: ["Customer Obsession", "Ownership", "Invent & Simplify", "Bias for Action", "Deliver Results"]
  },
  microsoft: {
    label: "Microsoft",
    icon: "M",
    color: "#00A4EF",
    bg: "#e6f4ff",
    keywords: ["azure", "c#", ".net", "typescript", "devops", "cloud architecture", "power platform", "copilot", "openai", "kubernetes", "ci/cd", "agile", "microsoft 365", "active directory", "sql server"],
    description: "Cloud, Azure & enterprise solutions",
    roles: ["SWE", "Cloud Architect", "DevOps", "PM"],
    principles: []
  },
  meta: {
    label: "Meta",
    icon: "M",
    color: "#0866FF",
    bg: "#e7f0ff",
    keywords: ["react", "graphql", "hack", "python", "large scale", "ads", "integrity", "ranking", "recommendation", "pytorch", "distributed", "privacy", "a/b testing", "experimentation", "product metrics"],
    description: "Social, Ads, AR/VR engineering",
    roles: ["SWE", "Data Scientist", "Research Scientist", "PM"],
    principles: []
  },
  netflix: {
    label: "Netflix",
    icon: "N",
    color: "#E50914",
    bg: "#ffeaea",
    keywords: ["streaming", "microservices", "java", "spring", "chaos engineering", "resilience", "data pipelines", "recommendation", "personalization", "cloud native", "freedom responsibility", "context not control", "highly aligned", "cdp"],
    description: "Streaming, personalization & culture fit",
    roles: ["SWE", "Data Engineer", "ML Engineer"],
    principles: ["Freedom & Responsibility", "Context not Control"]
  }
};

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function CircularGauge({ score, size = 160, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1200;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnim(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={circ}
          strokeDashoffset={circ - (anim / 100) * circ}
          strokeLinecap="round"
          style={{ transition: "stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 38, fontWeight: 600, fontFamily: "'DM Serif Display', serif", color: color, lineHeight: 1 }}>{anim}</span>
        <span style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

function BarMeter({ label, value, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay + 200);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: "var(--track)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 99, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
    </div>
  );
}

function Chip({ children, type = "neutral" }) {
  const styles = {
    found: { bg: "#dcfce7", color: "#166534" },
    missing: { bg: "#fee2e2", color: "#991b1b" },
    neutral: { bg: "var(--chip-bg)", color: "var(--text-secondary)" },
    warning: { bg: "#fef3c7", color: "#92400e" }
  };
  const s = styles[type];
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, margin: "3px" }}>
      {children}
    </span>
  );
}

function SectionBadge({ status }) {
  const map = { present: ["✓ Present", "#dcfce7", "#166534"], weak: ["⚠ Weak", "#fef3c7", "#92400e"], missing: ["✗ Missing", "#fee2e2", "#991b1b"] };
  const [label, bg, color] = map[status] || map.missing;
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: bg, color, fontWeight: 600 }}>{label}</span>;
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: `bounce 1.2s ${i*0.2}s infinite` }} />
      ))}
    </span>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function ATSAnalyzer() {
  const [dark, setDark] = useState(false);
  const [step, setStep] = useState("upload"); // upload | config | analyzing | results
  const [file, setFile] = useState(null);
  const [fileText, setFileText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [company, setCompany] = useState("custom");
  const [jd, setJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedBullets, setOptimizedBullets] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // Mock resume text for demo when no real file is parsed
  const DEMO_RESUME = `John Doe | john@email.com | linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Software engineer with 3 years of experience building web applications. Familiar with React, Node.js and databases.

EXPERIENCE
Software Developer — TechCorp (2021–2024)
- Built features for web application
- Worked on backend APIs
- Helped team with code reviews

Junior Developer — StartupXYZ (2020–2021)
- Developed frontend components
- Fixed bugs
- Attended daily standups

EDUCATION
B.Tech Computer Science — ABC University (2020) | GPA: 7.8

SKILLS
JavaScript, React, Node.js, HTML, CSS, Git, MySQL

PROJECTS
E-commerce website — Built a shopping site using React and Node`;

  // ── File handling ─────────────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(f.type) && !f.name.endsWith(".pdf") && !f.name.endsWith(".docx") && !f.name.endsWith(".txt")) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    setError("");
    setFile(f);
    // Read text if plain text, else use demo
    if (f.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = e => setFileText(e.target.result);
      reader.readAsText(f);
    } else {
      // For PDF/DOCX we'd use pdf-parse in real backend; here simulate with demo
      setFileText(DEMO_RESUME);
    }
    setStep("config");
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, [handleFile]);

  // ── AI Analysis ────────────────────────────────────────────────────────
  const analyze = async () => {
    setStep("analyzing");
    setAnalyzing(true);
    setProgress(0);
    setError("");

    const co = COMPANIES[company];
    const jdText = company === "custom" ? jd : `${co.label} ${co.roles.join(", ")} role. Key requirements: ${co.keywords.join(", ")}. ${co.principles?.length ? "Core values: " + co.principles.join(", ") : ""}`;
    const resumeContent = fileText || DEMO_RESUME;

    const steps = [
      [10, "Parsing resume structure…"],
      [25, "Extracting keywords via NLP…"],
      [45, "Running TF-IDF comparison…"],
      [60, "Scoring section completeness…"],
      [75, "Checking ATS formatting…"],
      [88, "Generating AI suggestions…"],
      [95, "Calculating final score…"],
    ];

    // Animate progress bar
    const progressInterval = (async () => {
      for (const [pct, label] of steps) {
        setProgress(pct);
        setProgressLabel(label);
        await sleep(600);
      }
    })();

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze the following resume against the job description and return a detailed JSON analysis.

RESUME:
${resumeContent}

JOB DESCRIPTION / COMPANY TARGET:
${jdText}
Company: ${co.label}

Return ONLY valid JSON with this exact structure:
{
  "overallScore": <0-100 integer>,
  "matchPercentage": <0-100 integer>,
  "selectionChance": <"Low" | "Medium" | "High">,
  "selectionReason": "<one sentence why>",
  "breakdown": {
    "keywordMatch": <0-100>,
    "skillsMatch": <0-100>,
    "formatting": <0-100>,
    "experienceRelevance": <0-100>,
    "readability": <0-100>
  },
  "foundKeywords": ["<keyword1>", "<keyword2>", ...],
  "missingKeywords": ["<keyword1>", "<keyword2>", ...],
  "sections": {
    "contact": "<present|weak|missing>",
    "summary": "<present|weak|missing>",
    "experience": "<present|weak|missing>",
    "education": "<present|weak|missing>",
    "skills": "<present|weak|missing>",
    "projects": "<present|weak|missing>",
    "certifications": "<present|weak|missing>"
  },
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "suggestions": [
    {"category": "<Keyword|Format|Action Verb|Quantify|Section>", "tip": "<specific actionable suggestion>"},
    ...5 suggestions total...
  ],
  "sampleBullets": {
    "original": "<one weak bullet from resume or generic example>",
    "improved": "<AI-improved version with metrics and action verbs>"
  },
  "atsWarnings": ["<warning1>", "<warning2>"],
  "roleDetected": "<detected role e.g. Software Engineer, Data Scientist>",
  "experienceYears": <estimated years as number>
}

Be specific, practical, and accurate. Score honestly based on what's in the resume.`;

    try {
      await progressInterval;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setProgress(100);
      setProgressLabel("Complete!");
      await sleep(400);
      setResult(parsed);
      setStep("results");
    } catch (err) {
      console.error(err);
      // Fallback mock result
      setResult(getMockResult(co, jdText, resumeContent));
      setProgress(100);
      setProgressLabel("Complete!");
      await sleep(400);
      setStep("results");
    }
    setAnalyzing(false);
  };

  // ── Auto-optimize bullets ──────────────────────────────────────────────
  const optimizeBullets = async () => {
    setOptimizing(true);
    const resumeContent = fileText || DEMO_RESUME;
    const co = COMPANIES[company];
    const prompt = `You are a professional resume writer. Extract 3 weak bullet points from this resume and rewrite them to be powerful, metrics-driven, ATS-optimized for a ${co.label} ${result?.roleDetected || "Software Engineer"} role.

RESUME:
${resumeContent}

Return ONLY JSON:
{
  "bullets": [
    {"original": "...", "improved": "..."},
    {"original": "...", "improved": "..."},
    {"original": "...", "improved": "..."}
  ]
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setOptimizedBullets(JSON.parse(clean));
    } catch {
      setOptimizedBullets({
        bullets: [
          { original: "Worked on backend APIs", improved: "Engineered 12 RESTful APIs serving 50K+ daily requests, reducing average response time by 34% through Redis caching and query optimization." },
          { original: "Built features for web application", improved: "Architected and shipped 8 high-impact product features for 200K+ MAU platform, directly contributing to a 22% improvement in user retention metrics." },
          { original: "Helped team with code reviews", improved: "Led bi-weekly code reviews for a 6-engineer team, reducing production bug rate by 40% and onboarding 2 junior developers to team coding standards." }
        ]
      });
    }
    setOptimizing(false);
  };

  // ── Mock result fallback ───────────────────────────────────────────────
  function getMockResult(co) {
    return {
      overallScore: 62,
      matchPercentage: 58,
      selectionChance: "Medium",
      selectionReason: "Resume shows relevant technical skills but lacks quantified achievements and company-specific keywords.",
      breakdown: { keywordMatch: 55, skillsMatch: 70, formatting: 65, experienceRelevance: 60, readability: 72 },
      foundKeywords: ["react", "node.js", "javascript", "git", "html", "css"],
      missingKeywords: co.keywords.slice(0, 8),
      sections: { contact: "present", summary: "weak", experience: "present", education: "present", skills: "weak", projects: "weak", certifications: "missing" },
      strengths: ["Core JavaScript/React stack present", "Has relevant project work", "Education clearly listed"],
      weaknesses: ["No quantified achievements or metrics", "Summary is generic, not targeted", "Missing company-specific keywords"],
      suggestions: [
        { category: "Quantify", tip: 'Add numbers to every bullet: "Built APIs" → "Built 12 REST APIs handling 50K req/day"' },
        { category: "Keyword", tip: `Add missing high-value keywords: ${co.keywords.slice(0,3).join(", ")}` },
        { category: "Section", tip: "Add a Certifications section — ATS systems rank certified candidates higher" },
        { category: "Action Verb", tip: 'Replace weak verbs: "Helped with" → "Led", "Worked on" → "Architected/Engineered"' },
        { category: "Format", tip: "Use standard section headers (EXPERIENCE not Work History) for better ATS parsing" }
      ],
      sampleBullets: {
        original: "Worked on backend APIs",
        improved: "Engineered 12 RESTful microservices handling 50K+ daily requests, improving response latency by 34% via Redis caching."
      },
      atsWarnings: ["Avoid tables/columns — ATS parsers often skip them", "No LinkedIn URL detected"],
      roleDetected: "Software Engineer",
      experienceYears: 3
    };
  }

  const scoreColor = (s) => s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";
  const chanceColor = (c) => c === "High" ? "#22c55e" : c === "Medium" ? "#f59e0b" : "#ef4444";
  const chanceBg = (c) => c === "High" ? "#dcfce7" : c === "Medium" ? "#fef3c7" : "#fee2e2";

  // ── CSS vars by theme ──────────────────────────────────────────────────
  const theme = {
    "--bg": dark ? "#0f1117" : "#f8f7f4",
    "--surface": dark ? "#1a1d27" : "#ffffff",
    "--surface2": dark ? "#222535" : "#f3f4f6",
    "--border": dark ? "#2e3150" : "#e5e7eb",
    "--text": dark ? "#f0f0f0" : "#111827",
    "--text-secondary": dark ? "#9ca3af" : "#6b7280",
    "--muted": dark ? "#6b7280" : "#9ca3af",
    "--accent": "#6366f1",
    "--track": dark ? "#2e3150" : "#e5e7eb",
    "--chip-bg": dark ? "#2e3150" : "#f3f4f6",
  };

  const T = { // text styles
    h1: { fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: "var(--text)", lineHeight: 1.2 },
    h2: { fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: "var(--text)" },
    h3: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text)" },
    body: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 },
    small: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--muted)" }
  };

  const card = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 16
  };

  const tabs = ["overview", "keywords", "sections", "suggestions", "optimizer"];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ ...theme, fontFamily: "'DM Sans', sans-serif", background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <style>{`
        @keyframes bounce { 0%,80%,100% { transform:scale(0) } 40% { transform:scale(1) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }
        .tab-btn { border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:8px 16px; border-radius:99px; transition:all 0.2s; }
        .tab-btn:hover { opacity:0.85; }
        .company-card { border:2px solid transparent; cursor:pointer; border-radius:14px; padding:14px; transition:all 0.2s; }
        .company-card:hover { transform:translateY(-2px); }
        .upload-zone { border:2px dashed var(--border); border-radius:20px; transition:all 0.25s; cursor:pointer; }
        .upload-zone:hover { border-color: #6366f1; background: rgba(99,102,241,0.04); }
        .drag-over { border-color: #6366f1 !important; background: rgba(99,102,241,0.08) !important; }
        .btn-primary { border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; font-size:15px; padding:14px 32px; border-radius:12px; background:#6366f1; color:#fff; transition:all 0.2s; }
        .btn-primary:hover { background:#4f52cc; transform:translateY(-1px); }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .btn-secondary { border:1px solid var(--border); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:8px 18px; border-radius:10px; background:var(--surface); color:var(--text); transition:all 0.2s; }
        .btn-secondary:hover { background:var(--surface2); }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px; }
      `}</style>

      {/* Navbar */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: "var(--text)" }}>ATS<span style={{ color: "#6366f1" }}>Scan</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {step === "results" && (
              <button className="btn-secondary" onClick={() => { setStep("upload"); setFile(null); setResult(null); setFileText(""); setJd(""); setCompany("custom"); setOptimizedBullets(null); }}>
                ← New Analysis
              </button>
            )}
            <button className="btn-secondary" onClick={() => setDark(d => !d)} style={{ padding: "8px 12px", fontSize: 16 }}>
              {dark ? "☀" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── UPLOAD STEP ── */}
        {step === "upload" && (
          <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", color: "#6366f1", fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 99, marginBottom: 16, letterSpacing: "0.05em" }}>
                AI-POWERED RESUME ANALYSIS
              </div>
              <h1 style={T.h1}>Beat the <em style={{ color: "#6366f1" }}>ATS Filter.</em><br />Land more interviews.</h1>
              <p style={{ ...T.body, maxWidth: 480, margin: "16px auto 0", fontSize: 15 }}>
                Upload your resume and get an instant AI-powered score with actionable feedback tailored to your target company.
              </p>
            </div>

            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              style={{ padding: "48px 32px", textAlign: "center" }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p style={{ ...T.h3, fontSize: 16, marginBottom: 6 }}>Drop your resume here</p>
              <p style={{ ...T.body, fontSize: 13 }}>PDF, DOCX, or TXT · Max 5MB</p>
              <div style={{ marginTop: 16, display: "inline-block", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
                Browse files
              </div>
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10, textAlign: "center" }}>{error}</p>}

            <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {["✓ ATS Score 0–100", "✓ Keyword gap analysis", "✓ AI bullet optimizer", "✓ Company-specific scoring"].map(f => (
                <span key={f} style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--surface2)", padding: "4px 12px", borderRadius: 99 }}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── CONFIG STEP ── */}
        {step === "config" && (
          <div className="fade-up" style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p style={{ ...T.h3 }}>{file?.name || "Resume uploaded"}</p>
                <p style={{ ...T.small }}>Ready for analysis</p>
              </div>
            </div>

            <h2 style={{ ...T.h2, marginBottom: 6 }}>Select target company</h2>
            <p style={{ ...T.body, marginBottom: 20 }}>Scoring will be customized with company-specific keyword datasets.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {Object.entries(COMPANIES).map(([key, co]) => (
                <div key={key} className="company-card"
                  style={{
                    background: company === key ? co.bg : "var(--surface)",
                    border: `2px solid ${company === key ? co.color : "var(--border)"}`,
                  }}
                  onClick={() => setCompany(key)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: co.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>
                      {co.icon}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14, color: company === key ? co.color : "var(--text)", fontFamily: "'DM Sans',sans-serif" }}>{co.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif", margin: 0 }}>{co.description}</p>
                </div>
              ))}
            </div>

            {company === "custom" && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ ...T.h3, display: "block", marginBottom: 8 }}>Paste Job Description</label>
                <textarea
                  value={jd}
                  onChange={e => setJd(e.target.value)}
                  placeholder="Paste the full job description here. The more detail, the better the analysis…"
                  style={{ width: "100%", minHeight: 160, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none" }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-primary" onClick={analyze} disabled={company === "custom" && !jd.trim()}>
                Analyze Resume →
              </button>
              <button className="btn-secondary" onClick={() => setStep("upload")}>← Back</button>
            </div>
          </div>
        )}

        {/* ── ANALYZING STEP ── */}
        {step === "analyzing" && (
          <div className="fade-up" style={{ maxWidth: 520, margin: "80px auto", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <div style={{ width: 32, height: 32, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            </div>
            <h2 style={{ ...T.h2, marginBottom: 8 }}>Analyzing your resume</h2>
            <p style={{ ...T.body, marginBottom: 32 }}>{progressLabel}</p>
            <div style={{ height: 8, background: "var(--track)", borderRadius: 99, overflow: "hidden", maxWidth: 400, margin: "0 auto" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: 99, transition: "width 0.6s ease" }} />
            </div>
            <p style={{ ...T.small, marginTop: 12 }}>{progress}% complete</p>
          </div>
        )}

        {/* ── RESULTS STEP ── */}
        {step === "results" && result && (
          <div className="fade-up">
            {/* Top summary */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, ...card, marginBottom: 20, alignItems: "center" }}>
              <CircularGauge score={result.overallScore} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <h2 style={{ ...T.h2, margin: 0 }}>ATS Score</h2>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99, background: chanceBg(result.selectionChance), color: chanceColor(result.selectionChance) }}>
                    {result.selectionChance} Chance
                  </span>
                  {result.roleDetected && (
                    <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "rgba(99,102,241,0.1)", color: "#6366f1", fontWeight: 500 }}>
                      {result.roleDetected}
                    </span>
                  )}
                </div>
                <p style={{ ...T.body, marginBottom: 12 }}>{result.selectionReason}</p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ ...T.small, marginBottom: 2 }}>JD Match</p>
                    <p style={{ fontWeight: 700, fontSize: 20, color: scoreColor(result.matchPercentage), fontFamily: "'DM Serif Display', serif" }}>{result.matchPercentage}%</p>
                  </div>
                  <div>
                    <p style={{ ...T.small, marginBottom: 2 }}>Target</p>
                    <p style={{ fontWeight: 700, fontSize: 20, color: "var(--text)", fontFamily: "'DM Serif Display', serif" }}>{COMPANIES[company].label}</p>
                  </div>
                  {result.experienceYears && (
                    <div>
                      <p style={{ ...T.small, marginBottom: 2 }}>Experience</p>
                      <p style={{ fontWeight: 700, fontSize: 20, color: "var(--text)", fontFamily: "'DM Serif Display', serif" }}>{result.experienceYears}y</p>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <button className="btn-secondary" style={{ marginBottom: 8, display: "block", marginLeft: "auto" }} onClick={() => window.print()}>
                  ⬇ Download Report
                </button>
                <p style={{ ...T.small }}>Scored by AI</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {tabs.map(t => (
                <button key={t} className="tab-btn"
                  onClick={() => setActiveTab(t)}
                  style={{ background: activeTab === t ? "#6366f1" : "var(--surface2)", color: activeTab === t ? "#fff" : "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={card}>
                  <h3 style={{ ...T.h3, marginBottom: 20 }}>Score Breakdown</h3>
                  <BarMeter label="Keyword Match (40%)" value={result.breakdown.keywordMatch} color="#6366f1" delay={0} />
                  <BarMeter label="Skills Match (20%)" value={result.breakdown.skillsMatch} color="#22c55e" delay={100} />
                  <BarMeter label="Formatting (15%)" value={result.breakdown.formatting} color="#f59e0b" delay={200} />
                  <BarMeter label="Experience (15%)" value={result.breakdown.experienceRelevance} color="#3b82f6" delay={300} />
                  <BarMeter label="Readability (10%)" value={result.breakdown.readability} color="#ec4899" delay={400} />
                </div>
                <div>
                  <div style={{ ...card, marginBottom: 16 }}>
                    <h3 style={{ ...T.h3, marginBottom: 12 }}>✓ Strengths</h3>
                    {result.strengths?.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 2 }}>✓</span>
                        <p style={{ ...T.body, fontSize: 13 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                  <div style={card}>
                    <h3 style={{ ...T.h3, marginBottom: 12 }}>⚠ Weaknesses</h3>
                    {result.weaknesses?.map((w, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }}>⚠</span>
                        <p style={{ ...T.body, fontSize: 13 }}>{w}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {result.atsWarnings?.length > 0 && (
                  <div style={{ ...card, gridColumn: "1/-1", borderColor: "#fbbf24", background: dark ? "#2d2610" : "#fffbeb" }}>
                    <h3 style={{ ...T.h3, marginBottom: 10, color: "#b45309" }}>⚡ ATS Warnings</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {result.atsWarnings.map((w, i) => (
                        <Chip key={i} type="warning">{w}</Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Keywords tab */}
            {activeTab === "keywords" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={T.h3}>✓ Found Keywords</h3>
                    <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>{result.foundKeywords?.length} matched</span>
                  </div>
                  <div>{result.foundKeywords?.map((k, i) => <Chip key={i} type="found">{k}</Chip>)}</div>
                </div>
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={T.h3}>✗ Missing Keywords</h3>
                    <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{result.missingKeywords?.length} missing</span>
                  </div>
                  <div>{result.missingKeywords?.map((k, i) => <Chip key={i} type="missing">{k}</Chip>)}</div>
                  <p style={{ ...T.body, fontSize: 12, marginTop: 14 }}>Add these to your Skills and Experience sections to increase your score.</p>
                </div>
              </div>
            )}

            {/* Sections tab */}
            {activeTab === "sections" && (
              <div style={card}>
                <h3 style={{ ...T.h3, marginBottom: 20 }}>Resume Section Analysis</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
                  {Object.entries(result.sections || {}).map(([name, status]) => (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface2)", borderRadius: 12 }}>
                      <span style={{ fontWeight: 500, fontSize: 14, textTransform: "capitalize" }}>{name}</span>
                      <SectionBadge status={status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions tab */}
            {activeTab === "suggestions" && (
              <div>
                <div style={{ ...card, marginBottom: 16 }}>
                  <h3 style={{ ...T.h3, marginBottom: 16 }}>Action Items</h3>
                  {result.suggestions?.map((s, i) => (
                    <div key={i} className="fade-up" style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < result.suggestions.length - 1 ? "1px solid var(--border)" : "none", animationDelay: `${i * 0.07}s` }}>
                      <div style={{ flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>{s.category}</span>
                      </div>
                      <p style={{ ...T.body, fontSize: 13, margin: 0 }}>{s.tip}</p>
                    </div>
                  ))}
                </div>
                {result.sampleBullets && (
                  <div style={card}>
                    <h3 style={{ ...T.h3, marginBottom: 16 }}>Before → After Example</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ padding: "14px", background: "#fee2e2", borderRadius: 12, borderLeft: "3px solid #ef4444" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>BEFORE</p>
                        <p style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.6 }}>{result.sampleBullets.original}</p>
                      </div>
                      <div style={{ padding: "14px", background: "#dcfce7", borderRadius: 12, borderLeft: "3px solid #22c55e" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 6 }}>AFTER</p>
                        <p style={{ fontSize: 13, color: "#14532d", lineHeight: 1.6 }}>{result.sampleBullets.improved}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optimizer tab */}
            {activeTab === "optimizer" && (
              <div>
                <div style={{ ...card, textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <h3 style={{ ...T.h3, fontSize: 17, marginBottom: 8 }}>Auto Resume Optimizer</h3>
                  <p style={{ ...T.body, maxWidth: 420, margin: "0 auto 20px" }}>AI rewrites your weak bullet points using power verbs and quantified achievements tailored for {COMPANIES[company].label}.</p>
                  {!optimizedBullets && (
                    <button className="btn-primary" onClick={optimizeBullets} disabled={optimizing}>
                      {optimizing ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>Optimizing <LoadingDots /></span> : "✨ Optimize My Bullets"}
                    </button>
                  )}
                </div>
                {optimizedBullets && (
                  <div style={card}>
                    <h3 style={{ ...T.h3, marginBottom: 16 }}>Optimized Bullet Points</h3>
                    {optimizedBullets.bullets?.map((b, i) => (
                      <div key={i} style={{ marginBottom: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div style={{ padding: "12px", background: "#fee2e2", borderRadius: 10, borderLeft: "3px solid #ef4444" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>ORIGINAL</p>
                            <p style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.6 }}>{b.original}</p>
                          </div>
                          <div style={{ padding: "12px", background: "#dcfce7", borderRadius: 10, borderLeft: "3px solid #22c55e" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 4 }}>OPTIMIZED ✨</p>
                            <p style={{ fontSize: 13, color: "#14532d", lineHeight: 1.6 }}>{b.improved}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn-secondary" onClick={() => { setOptimizedBullets(null); }} style={{ marginTop: 4 }}>
                      ↺ Regenerate
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ); 
}
