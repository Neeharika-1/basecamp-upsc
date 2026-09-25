/* ==========================================================================
   BASE CAMP — UPSC preparation tracker
   Vanilla JS, no build step, no dependencies. All data lives in this
   browser's localStorage under STORAGE_KEY. See README.md for deployment.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "basecamp-upsc-state-v1";
  const DEFAULT_HABITS = ["Exercise", "Reading (non-UPSC)", "Sleep 7+ hrs"];
  const VIEWS = ["dashboard", "syllabus", "planner", "affairs", "tests", "goals", "settings"];
  const TRASH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M9 6V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V6m-9 0 .6 12.4a1.5 1.5 0 0 0 1.5 1.4h5.8a1.5 1.5 0 0 0 1.5-1.4L19 6"/></svg>';
  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff9fc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>';

  let state;

  /* ---------------------------------------------------------------------
     Utilities
     --------------------------------------------------------------------- */

  function uid() { return Math.random().toString(36).slice(2, 10); }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function fmtDateShort(iso) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
  }

  function fmtMinutes(m) {
    m = m || 0;
    const h = Math.floor(m / 60), mm = m % 60;
    return h ? `${h}h ${mm}m` : `${mm}m`;
  }

  function daysUntil(iso) {
    const a = new Date(todayISO() + "T00:00:00");
    const b = new Date(iso + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }

  function priorityRank(p) { return p === "high" ? 0 : p === "medium" ? 1 : 2; }

  function last7Dates() {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  }

  /* ---------------------------------------------------------------------
     Default syllabus content — the official UPSC CSE structure.
     Optional-subject topics are left for the candidate to add themselves.
     --------------------------------------------------------------------- */

  function topic(label) { return { id: uid(), label, done: false, rev: 0, note: "" }; }

  function defaultSyllabus() {
    return [
      {
        key: "p_gs1", title: "Prelims — GS Paper I",
        topics: [
          "Current events of national and international importance",
          "History of India — Ancient & Medieval overview",
          "History of India — Modern India & the National Movement",
          "Indian Geography — Physical",
          "Indian Geography — Human & Economic",
          "World Geography — Physical, Economic & Social",
          "Indian Polity — Constitution & Political System",
          "Indian Polity — Panchayati Raj & Governance",
          "Indian Polity — Public Policy & Rights Issues",
          "Economic & Social Development — Sustainable Development",
          "Economic & Social Development — Poverty & Inclusion",
          "Economic & Social Development — Demographics & Social Sector Schemes",
          "Environment, Ecology, Biodiversity & Climate Change",
          "General Science — Physics & Chemistry basics",
          "General Science — Biology & everyday science",
          "Science & Technology — developments and applications"
        ].map(topic)
      },
      {
        key: "p_csat", title: "Prelims — CSAT (Qualifying)",
        topics: [
          "Comprehension passages",
          "Interpersonal skills & communication",
          "Logical reasoning",
          "Analytical ability",
          "Decision-making & problem-solving",
          "General mental ability",
          "Basic numeracy (Class X level)",
          "Data interpretation (charts, graphs, tables)"
        ].map(topic)
      },
      {
        key: "m_essay", title: "Mains — Essay",
        topics: [
          "Essay — Section A practice",
          "Essay — Section B practice",
          "Building a quotes & examples bank"
        ].map(topic)
      },
      {
        key: "m_gs1", title: "Mains — GS Paper I",
        topics: [
          "Indian culture — art forms, literature, architecture",
          "Modern Indian history (mid-18th century onwards)",
          "Indian freedom struggle",
          "Post-independence consolidation & reorganisation",
          "World history (18th century events onwards)",
          "Indian society — diversity & salient features",
          "Role of women & women's organisations",
          "Population & associated issues",
          "Poverty & developmental issues",
          "Urbanisation — problems & remedies",
          "Globalisation's effect on Indian society",
          "Communalism, regionalism & secularism",
          "World physical geography",
          "Distribution of key natural resources",
          "Factors for location of primary/secondary/tertiary industries",
          "Geophysical phenomena — earthquakes, tsunami, volcanic activity, cyclones"
        ].map(topic)
      },
      {
        key: "m_gs2", title: "Mains — GS Paper II",
        topics: [
          "Indian Constitution — historical underpinnings, evolution, features",
          "Amendments, significant provisions & basic structure",
          "Functions & responsibilities of the Union and States",
          "Separation of powers & dispute redressal mechanisms",
          "Parliament & State legislatures — structure & functioning",
          "Structure, organisation & functioning of the Judiciary",
          "Government policies & interventions for development",
          "Development processes — role of NGOs, SHGs, donors, civil society",
          "Welfare schemes for vulnerable sections",
          "Health, education & human resources — social sector issues",
          "Governance — e-governance, transparency, accountability",
          "Role of civil services in a democracy",
          "India and its neighbourhood — relations",
          "Bilateral, regional & global groupings involving India",
          "Effect of developed/developing countries' policies on India",
          "International institutions, agencies and their mandate"
        ].map(topic)
      },
      {
        key: "m_gs3", title: "Mains — GS Paper III",
        topics: [
          "Indian economy — planning, resource mobilisation, growth",
          "Government budgeting",
          "Inclusive growth & issues arising from it",
          "Land reforms in India",
          "Agriculture — e-technology, storage, marketing, food processing",
          "Agriculture — subsidies, PDS, buffer stocks, food security",
          "Science & Technology — developments and applications",
          "IT, space, computers, robotics, nano-tech, biotech, IPR",
          "Environmental impact assessment",
          "Disaster and disaster management",
          "Internal security — linkages of extremism",
          "Role of media & social networking sites in internal security",
          "Money laundering and its prevention",
          "Border area security challenges",
          "Organised crime & terrorism",
          "Security forces & agencies — mandate"
        ].map(topic)
      },
      {
        key: "m_gs4", title: "Mains — GS Paper IV",
        topics: [
          "Ethics and human interface",
          "Attitude — content, structure, function",
          "Aptitude & foundational values for civil service",
          "Emotional intelligence — concepts and utility",
          "Contributions of moral thinkers and philosophers",
          "Probity in governance — concept of public service",
          "Case studies on the above"
        ].map(topic)
      },
      { key: "m_optional", title: "Mains — Optional", topics: [] }
    ];
  }

  /* ---------------------------------------------------------------------
     Optional-subject syllabi — top-level UPSC topic headings for the
     most commonly chosen optionals. Every optional has exactly two
     papers. Subjects not listed here still get a proper two-paper
     structure, just with an empty topic list to fill in yourself.
     --------------------------------------------------------------------- */

  const OPTIONAL_SYLLABI = {
    "public administration": {
      1: ["Administrative Theory — evolution, schools & principles", "Administrative Thought — Woodrow Wilson to modern theorists",
        "Administrative Behaviour — decision-making, communication, morale", "Organisations — structures, systems & management theories",
        "Accountability & Control — legislative, executive & judicial", "Administrative Law", "Comparative Public Administration",
        "Development Dynamics & Administration", "Personnel Administration", "Public Policy — formulation & implementation",
        "Techniques of Administrative Improvement", "Financial Administration — budgeting & audit"],
      2: ["Evolution of Indian Administration", "Philosophical & Constitutional framework of government",
        "Public Sector Undertakings", "Union Government & Management", "Plans & Priorities in India",
        "State Government & Management", "District Administration since Independence",
        "Civil Services in India", "Financial Management in India", "Administrative Reforms since Independence",
        "Rural & Urban Local Government", "Law & Order Administration", "Significant Issues in Indian Administration"]
    },
    "sociology": {
      1: ["Sociology — the Discipline (scope, comparison with other disciplines)", "Sociology as Science — methods of inquiry",
        "Research Methods & Analysis", "Sociological Thinkers — Marx, Durkheim, Weber & others",
        "Stratification & Mobility", "Works & Economic Life", "Politics & Society", "Religion & Society",
        "Systems of Kinship", "Social Change in Modern Society"],
      2: ["Rural & Agrarian Social Structure in India", "Caste System & its changing nature",
        "Tribal communities in India", "Social Classes in India", "Systems of Kinship in India",
        "Religion & Society in India", "Population Dynamics & demographic transition",
        "Challenges of Social Transformation — crime, violence, illiteracy, poverty",
        "Rural & Urban Transformation in India", "Social Movements in Modern India"]
    },
    "geography": {
      1: ["Physical Geography — Geomorphology", "Physical Geography — Climatology",
        "Physical Geography — Oceanography", "Physical Geography — Biogeography",
        "Physical Geography — Environmental Geography", "Human Geography — Perspectives, thought & migration",
        "Economic Geography — resources, agriculture & industry", "Population & Settlement Geography",
        "Regional Planning", "Models, Theories & Laws in Human Geography"],
      2: ["Physical Setting of India", "Resources of India", "Agriculture in India",
        "Industry in India", "Transport, Communication & Trade in India", "Cultural Setting of India",
        "Settlements in India", "Regional Development & Planning in India", "Political Aspects of Indian Geography",
        "Contemporary Issues — environmental hazards, regional disparity, urban problems"]
    },
    "history": {
      1: ["Sources & Pre-history", "Indus Valley Civilization", "Megalithic & Vedic Societies",
        "Buddhist & Jain movements & Mauryan Empire", "Post-Mauryan India", "Guptas & post-Gupta period",
        "Regional cultures & Southern dynasties", "Medieval India — Delhi Sultanate & Mughals",
        "18th century — decline of the Mughal Empire", "Modern World — Enlightenment to World Wars"],
      2: ["European penetration & British conquest of India", "British Administration & economic policies",
        "Social & Religious reform movements in 19th-century India", "Indian National Movement — 1885–1947",
        "Constitutional developments & Partition", "Post-Independence Consolidation",
        "India's Foreign Policy", "Emergence of a New Social Structure",
        "World History — colonialism & decolonization", "World History — Cold War & new international order"]
    },
    "political science and international relations": {
      1: ["Political Theory & its Tradition", "Theories of the State", "Justice, Equality, Rights & Democracy",
        "Concepts of Power, Hegemony, Ideology & Legitimacy", "Political Ideologies — liberalism, socialism, Marxism, Gandhism",
        "Indian Political Thought", "Western Political Thought", "Indian Government & Politics — Constitution",
        "Indian Government & Politics — Organs & institutions", "Grassroots Politics & Social Movements in India"],
      2: ["Comparative Political Analysis & Political Systems", "Globalisation & its critics",
        "Approaches to the Study of International Relations", "Key concepts in International Relations",
        "Changing International Political Order", "Evolution of the International Economic System",
        "United Nations & other international institutions", "India & its Neighbours",
        "India & major world powers / regions", "India & the UN, WTO, disarmament & global commons"]
    },
    "anthropology": {
      1: ["Meaning, Scope & Development of Anthropology", "Human Evolution & Primatology",
        "Concept of Race & racial classification", "Fundamentals of Culture & Society",
        "Marriage, Family & Kinship", "Economic & Political Organisation", "Religion & Society",
        "Anthropological Theories", "Culture, Language & Communication", "Research Methods in Anthropology"],
      2: ["Evolution of Indian Society — Palaeolithic to modern", "Demographic profile of India",
        "Elements of Indian Village, Tribal & Peasant society", "Structure & Nature of Tribal Society in India",
        "Impact of Hinduism, Buddhism, Islam & Christianity on tribal societies", "Emergence of Man in India",
        "Tribal situation in India — problems & development", "Impact of Modernisation on Tribal societies",
        "Role of Anthropology in Tribal & Rural Development", "Contributions of Anthropologists to Indian society"]
    },
    "economics": {
      1: ["Advanced Micro Economics — theory of consumer & producer behaviour", "Theory of General Equilibrium",
        "Welfare Economics", "Theories of Growth", "Advanced Macro Economics",
        "Money, Banking & Finance", "International Economics", "Public Finance",
        "Development & Planning experience of India"],
      2: ["Indian Economy in pre-independence era", "Indian Economy since Independence — planning strategy",
        "Growth, Development & Structural change", "Population & poverty in India",
        "Agriculture & rural development in India", "Industry in India", "Foreign trade of India",
        "Money & Banking in India", "Public Finance in India", "Current developments in the Indian economy"]
    },
    "philosophy": {
      1: ["Plato to Kant — Western Philosophy", "Hegel, Marx, Nietzsche & Existentialism",
        "Analytic Philosophy — Russell, Wittgenstein, logical positivism", "Phenomenology & Sartre",
        "Charvaka, Jaina & Buddhist Philosophy", "Nyaya-Vaisesika, Samkhya & Yoga", "Mimamsa & Vedanta",
        "Aurobindo, Radhakrishnan, Gandhi & the concept of man"],
      2: ["Philosophy of religion — nature of religious experience", "Concept of God & problem of evil",
        "Logic & knowledge — non-cognitivism, means of knowledge", "Socio-political Philosophy — nature & justification of the state",
        "Justice, equality, rights & duties", "Human destiny — bondage, liberation, happiness",
        "Religion & morality", "Ethics & society — applied ethics, human rights, environmental ethics"]
    }
  };

  function findOptionalSyllabus(subject) {
    if (!subject) return null;
    const key = subject.trim().toLowerCase();
    if (OPTIONAL_SYLLABI[key]) return OPTIONAL_SYLLABI[key];
    // loose aliasing for common short forms
    const aliases = {
      "psir": "political science and international relations",
      "pol sci": "political science and international relations",
      "political science": "political science and international relations",
      "pub ad": "public administration",
      "public ad": "public administration",
      "geo": "geography",
      "anthro": "anthropology",
      "history optional": "history"
    };
    if (aliases[key] && OPTIONAL_SYLLABI[aliases[key]]) return OPTIONAL_SYLLABI[aliases[key]];
    return null;
  }

  /* ---------------------------------------------------------------------
     Splits the single generic "Mains — Optional" slot into a proper
     two-paper structure the moment a candidate names their optional
     subject in Settings, pre-loading topics for the subjects we know.
     Safe to call repeatedly — never overwrites topics a candidate has
     already checked, noted, or added themselves.
     --------------------------------------------------------------------- */

  function ensureOptionalPapers(subject) {
    const list = state.syllabus;
    const legacyIdx = list.findIndex(p => p.key === "m_optional");
    const hasSplit = list.some(p => p.key === "m_optional_1");
    const known = findOptionalSyllabus(subject);

    if (legacyIdx !== -1 && !hasSplit) {
      const legacy = list[legacyIdx];
      const paper1 = { key: "m_optional_1", title: "Mains — Optional Paper I", topics: legacy.topics.slice() };
      const paper2 = { key: "m_optional_2", title: "Mains — Optional Paper II", topics: [] };
      if (known && paper1.topics.length === 0) paper1.topics = known[1].map(topic);
      if (known && paper2.topics.length === 0) paper2.topics = known[2].map(topic);
      list.splice(legacyIdx, 1, paper1, paper2);
      state.ui.openPapers.m_optional_1 = true;
      state.ui.openPapers.m_optional_2 = true;
      return true;
    }

    if (hasSplit && known) {
      // Already split — only fill in topics if the candidate hasn't added any of their own yet.
      let filled = false;
      const p1 = list.find(p => p.key === "m_optional_1");
      const p2 = list.find(p => p.key === "m_optional_2");
      if (p1 && p1.topics.length === 0) { p1.topics = known[1].map(topic); filled = true; }
      if (p2 && p2.topics.length === 0) { p2.topics = known[2].map(topic); filled = true; }
      return filled;
    }

    return false;
  }

  /* ---------------------------------------------------------------------
     State: defaults, load, save
     --------------------------------------------------------------------- */

  function defaultState() {
    return {
      ui: { lastView: "dashboard", openPapers: { p_gs1: true } },
      settings: { name: "", examDate: "", optionalSubject: "" },
      syllabus: defaultSyllabus(),
      planner: { tasks: [] },
      affairs: { entries: [] },
      tests: { scores: [] },
      goals: { items: [], habits: DEFAULT_HABITS.map(name => ({ id: uid(), name })), log: {} },
      studyLog: { sessions: [] }
    };
  }

  function loadState() {
    let parsed = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Base Camp: couldn't read saved data, starting fresh.", err);
    }
    const base = defaultState();
    if (!parsed || typeof parsed !== "object") { state = base; return; }

    state = base;
    state.ui = Object.assign(base.ui, parsed.ui);
    state.settings = Object.assign(base.settings, parsed.settings);
    state.planner = Object.assign(base.planner, parsed.planner);
    state.affairs = Object.assign(base.affairs, parsed.affairs);
    state.tests = Object.assign(base.tests, parsed.tests);
    state.studyLog = Object.assign(base.studyLog, parsed.studyLog);
    state.goals = Object.assign(base.goals, parsed.goals);
    if (!state.goals.habits || !state.goals.habits.length) state.goals.habits = base.goals.habits;
    if (!state.goals.log) state.goals.log = {};
    if (Array.isArray(parsed.syllabus) && parsed.syllabus.length) state.syllabus = parsed.syllabus;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Base Camp: couldn't save — your browser storage may be full or disabled.", err);
      toast("Couldn't save — storage may be full");
    }
  }

  /* ---------------------------------------------------------------------
     Progress helpers
     --------------------------------------------------------------------- */

  function paperProgress(paper) {
    const total = paper.topics.length;
    const done = paper.topics.filter(t => t.done).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function overallProgress() {
    let total = 0, done = 0;
    state.syllabus.forEach(p => { total += p.topics.length; done += p.topics.filter(t => t.done).length; });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function paperDisplayTitle(paper) {
    const subj = state.settings.optionalSubject;
    if (paper.key === "m_optional" && subj) return `Mains — Optional (${subj})`;
    if (paper.key === "m_optional_1") return subj ? `Optional Paper I (${subj})` : "Mains — Optional Paper I";
    if (paper.key === "m_optional_2") return subj ? `Optional Paper II (${subj})` : "Mains — Optional Paper II";
    return paper.title;
  }

  function paperShortLabel(paper) {
    const subj = state.settings.optionalSubject;
    if (paper.key === "m_optional") return subj ? `Optional — ${subj}` : "Optional";
    if (paper.key === "m_optional_1") return subj ? `Optional I — ${subj}` : "Optional Paper I";
    if (paper.key === "m_optional_2") return subj ? `Optional II — ${subj}` : "Optional Paper II";
    return paper.title.replace(/^Prelims — /, "P · ").replace(/^Mains — /, "M · ");
  }

  /* ---------------------------------------------------------------------
     Dashboard
     --------------------------------------------------------------------- */

  function sumSessionMinutes(dateISO) {
    return state.studyLog.sessions.filter(s => s.date === dateISO).reduce((a, s) => a + s.minutes, 0);
  }

  function sumSessionMinutesLastNDays(n) {
    const set = new Set();
    for (let i = 0; i < n; i++) { const d = new Date(); d.setDate(d.getDate() - i); set.add(d.toISOString().slice(0, 10)); }
    return state.studyLog.sessions.filter(s => set.has(s.date)).reduce((a, s) => a + s.minutes, 0);
  }

  function studyStreak() {
    const dates = new Set(state.studyLog.sessions.map(s => s.date));
    return consecutiveStreak(dates);
  }

  function consecutiveStreak(dateSet) {
    let streak = 0;
    let d = new Date();
    let iso = todayISO();
    if (!dateSet.has(iso)) { d.setDate(d.getDate() - 1); iso = d.toISOString().slice(0, 10); }
    while (dateSet.has(iso)) { streak++; d.setDate(d.getDate() - 1); iso = d.toISOString().slice(0, 10); }
    return streak;
  }

  function renderDashboard() {
    document.getElementById("todayLabel").textContent =
      new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    document.getElementById("greeting").textContent = state.settings.name ? `${timeGreet}, ${state.settings.name}` : "Dashboard";

    renderHero();
    renderStatTiles();
    renderTodayTasksPanel();
    renderRecentSessions();
    renderDashSyllabusBars();
  }

  function renderHero() {
    const el = document.getElementById("heroBlock");
    const todayMin = sumSessionMinutes(todayISO());
    const weekMin = sumSessionMinutesLastNDays(7);
    const streak = studyStreak();

    let left;
    if (state.settings.examDate) {
      const diff = daysUntil(state.settings.examDate);
      if (diff > 0) {
        left = `<div><div class="hero-label">Countdown to Prelims</div>
          <div class="hero-number">${diff}<small>days to go</small></div>
          <div class="hero-date">${fmtDate(state.settings.examDate)}</div></div>`;
      } else if (diff === 0) {
        left = `<div><div class="hero-label">Countdown to Prelims</div>
          <div class="hero-number">Today</div>
          <div class="hero-date">${fmtDate(state.settings.examDate)}</div></div>`;
      } else {
        left = `<div><div class="hero-label">Prelims date has passed</div>
          <div class="hero-empty">Update your target date in <a href="#" data-goto="settings">Settings</a> once the next cycle is notified.</div></div>`;
      }
    } else {
      left = `<div><div class="hero-label">Countdown to Prelims</div>
        <div class="hero-empty">Set your target Prelims date in <a href="#" data-goto="settings">Settings</a> to start the countdown.</div></div>`;
    }

    el.innerHTML = left + `
      <div class="hero-side">
        <div class="hero-side-stat"><span class="n num">${fmtMinutes(todayMin)}</span><span class="l">today</span></div>
        <div class="hero-side-stat"><span class="n num">${fmtMinutes(weekMin)}</span><span class="l">this week</span></div>
        <div class="hero-side-stat"><span class="n num">${streak}d</span><span class="l">streak</span></div>
      </div>`;
  }

  function renderStatTiles() {
    const el = document.getElementById("statTiles");
    const tiles = [
      { n: fmtMinutes(sumSessionMinutes(todayISO())), l: "Logged today" },
      { n: fmtMinutes(sumSessionMinutesLastNDays(7)), l: "Logged this week" },
      { n: studyStreak() + "d", l: "Study streak" },
      { n: overallProgress().pct + "%", l: "Syllabus covered" }
    ];
    el.innerHTML = tiles.map(t => `<div class="stat"><span class="n num">${t.n}</span><span class="l">${t.l}</span></div>`).join("");
  }

  function renderTodayTasksPanel() {
    const el = document.getElementById("todayTasks");
    const items = state.planner.tasks
      .filter(t => !t.done && t.date === todayISO())
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
      .slice(0, 5);
    el.innerHTML = items.length ? items.map(taskRowHTML).join("") : '<div class="list-empty">Nothing scheduled for today.</div>';
  }

  function renderRecentSessions() {
    const el = document.getElementById("recentSessions");
    const items = state.studyLog.sessions.slice(-5).reverse();
    el.innerHTML = items.length ? items.map(sessionRowHTML).join("") : '<div class="list-empty">No sessions logged yet.</div>';
  }

  function sessionRowHTML(s) {
    return `<div class="row" data-id="${s.id}">
      <div class="row-body">
        <div class="row-title">${escapeHtml(s.subject)} <span class="num" style="color:var(--muted);font-size:0.78rem;">${s.minutes}m</span></div>
        <div class="row-meta"><span>${fmtDateShort(s.date)}</span>${s.note ? `<span>${escapeHtml(s.note)}</span>` : ""}</div>
      </div>
      <button class="row-del" data-action="delete-session" data-id="${s.id}" aria-label="Delete session">${TRASH_SVG}</button>
    </div>`;
  }

  function renderDashSyllabusBars() {
    const el = document.getElementById("dashSyllabusBars");
    el.innerHTML = state.syllabus.map(p => {
      const { pct } = paperProgress(p);
      return `<div class="bar-row">
        <div class="bar-label">${escapeHtml(paperShortLabel(p))}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="bar-pct num">${pct}%</div>
      </div>`;
    }).join("");
  }

  /* ---------------------------------------------------------------------
     Syllabus
     --------------------------------------------------------------------- */

  let syllabusWrap;

  function renderSyllabus() {
    syllabusWrap = syllabusWrap || document.getElementById("syllabusAccordion");
    syllabusWrap.innerHTML = state.syllabus.map(paperHTML).join("");
    updateOverallUI();
  }

  function paperHTML(paper) {
    const { total, done, pct } = paperProgress(paper);
    const open = !!state.ui.openPapers[paper.key];
    return `<div class="paper-block ${open ? "open" : ""}" data-key="${paper.key}">
      <button class="paper-head" data-action="toggle-paper" data-paper="${paper.key}">
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
        <div class="title">
          <h3>${escapeHtml(paperDisplayTitle(paper))}</h3>
          <div class="sub">${done} of ${total} topics covered</div>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="pct num">${pct}%</div>
      </button>
      <div class="paper-body">${paperBodyInner(paper)}</div>
    </div>`;
  }

  function paperBodyInner(paper) {
    const topics = paper.topics.map(t => topicHTML(paper.key, t)).join("")
      || '<div class="list-empty">No topics yet — add one below.</div>';
    return topics + `<div class="add-topic-row">
      <input type="text" placeholder="Add a topic…" data-add-input="${paper.key}">
      <button class="btn btn-sm" data-action="add-topic" data-paper="${paper.key}">Add</button>
    </div>`;
  }

  function topicHTML(paperKey, t) {
    const revLevel = Math.min(t.rev, 3);
    const revClass = t.rev > 0 ? `r${revLevel}` : "";
    const revLabel = t.rev > 0 ? `rev ×${t.rev}` : "revise";
    return `<div class="topic ${t.done ? "done" : ""}" data-topic="${t.id}">
      <div class="topic-head">
        <button class="row-check" data-action="toggle-topic" data-paper="${paperKey}" data-topic="${t.id}" aria-label="Mark covered">${CHECK_SVG}</button>
        <label class="topic-label" data-action="toggle-topic" data-paper="${paperKey}" data-topic="${t.id}">${escapeHtml(t.label)}</label>
        <button class="rev-btn ${revClass}" data-action="cycle-rev" data-paper="${paperKey}" data-topic="${t.id}">${revLabel}</button>
        <button class="row-del" data-action="delete-topic" data-paper="${paperKey}" data-topic="${t.id}" aria-label="Remove topic">${TRASH_SVG}</button>
      </div>
      <input type="text" class="topic-note" placeholder="Note…" value="${escapeHtml(t.note || "")}" data-action="note-topic" data-paper="${paperKey}" data-topic="${t.id}">
    </div>`;
  }

  function renderPaperBody(key) {
    const paper = state.syllabus.find(p => p.key === key);
    const block = syllabusWrap.querySelector(`.paper-block[data-key="${key}"]`);
    if (!paper || !block) return;
    block.querySelector(".paper-body").innerHTML = paperBodyInner(paper);
  }

  function updatePaperHeader(key) {
    const paper = state.syllabus.find(p => p.key === key);
    const block = syllabusWrap.querySelector(`.paper-block[data-key="${key}"]`);
    if (!paper || !block) return;
    const { total, done, pct } = paperProgress(paper);
    block.querySelector(".sub").textContent = `${done} of ${total} topics covered`;
    block.querySelector(".paper-head .bar-fill").style.width = pct + "%";
    block.querySelector(".paper-head .pct").textContent = pct + "%";
  }

  function updateOverallUI() {
    const { pct } = overallProgress();
    const fill = document.getElementById("overallBarFill");
    const label = document.getElementById("overallPct");
    if (fill) fill.style.width = pct + "%";
    if (label) label.textContent = pct + "%";
  }

  function addTopic(paperKey) {
    const input = syllabusWrap.querySelector(`[data-add-input="${paperKey}"]`);
    const val = input.value.trim();
    if (!val) return;
    const paper = state.syllabus.find(p => p.key === paperKey);
    paper.topics.push(topic(val));
    saveState();
    renderPaperBody(paperKey);
    updatePaperHeader(paperKey);
    updateOverallUI();
  }

  /* ---------------------------------------------------------------------
     Planner
     --------------------------------------------------------------------- */

  function taskRowHTML(t) {
    const isOverdue = !t.done && t.date < todayISO();
    const isToday = !t.done && t.date === todayISO();
    const cls = t.done ? "done" : isOverdue ? "overdue" : isToday ? "today" : "";
    return `<div class="row ${cls}" data-id="${t.id}">
      <button class="row-check" data-action="toggle-task" data-id="${t.id}" aria-label="Mark done">${CHECK_SVG}</button>
      <div class="row-body">
        <div class="row-title">${escapeHtml(t.title)}</div>
        <div class="row-meta">
          <span>${fmtDateShort(t.date)}</span>
          ${t.subject ? `<span>${escapeHtml(t.subject)}</span>` : ""}
          <span class="tag ${t.priority}">${t.priority}</span>
        </div>
      </div>
      <button class="row-del" data-action="delete-task" data-id="${t.id}" aria-label="Delete task">${TRASH_SVG}</button>
    </div>`;
  }

  function fillList(elId, items, emptyText) {
    document.getElementById(elId).innerHTML = items.length ? items.map(taskRowHTML).join("") : `<div class="list-empty">${emptyText}</div>`;
  }

  function renderPlanner() {
    const today = todayISO();
    const tasks = state.planner.tasks;
    fillList("taskOverdue", tasks.filter(t => !t.done && t.date < today).sort((a, b) => a.date.localeCompare(b.date)), "Nothing overdue.");
    fillList("taskToday", tasks.filter(t => !t.done && t.date === today).sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)), "Nothing scheduled for today.");
    fillList("taskUpcoming", tasks.filter(t => !t.done && t.date > today).sort((a, b) => a.date.localeCompare(b.date)), "Nothing else on the horizon yet.");
    fillList("taskDone", tasks.filter(t => t.done).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20), "No completed tasks yet.");
  }

  /* ---------------------------------------------------------------------
     Current Affairs
     --------------------------------------------------------------------- */

  function caRowHTML(c) {
    return `<div class="row" style="align-items:flex-start;" data-id="${c.id}">
      <div class="row-body">
        <div class="row-title">${escapeHtml(c.title)}</div>
        <div class="row-meta"><span>${fmtDateShort(c.date)}</span><span class="tag">${escapeHtml(c.category)}</span></div>
        ${c.notes ? `<p style="margin:0.35rem 0 0;font-size:0.82rem;color:var(--muted);">${escapeHtml(c.notes)}</p>` : ""}
      </div>
      <button class="row-del" data-action="delete-ca" data-id="${c.id}" aria-label="Delete entry">${TRASH_SVG}</button>
    </div>`;
  }

  function renderAffairs(filter) {
    filter = filter || "";
    let items = [...state.affairs.entries].sort((a, b) => b.date.localeCompare(a.date));
    if (filter) items = items.filter(x => x.category === filter);
    document.getElementById("caList").innerHTML = items.length ? items.map(caRowHTML).join("") : '<div class="list-empty">No entries yet.</div>';
  }

  /* ---------------------------------------------------------------------
     Test Scores
     --------------------------------------------------------------------- */

  function scoreRowHTML(s) {
    const pct = ((s.score / s.max) * 100).toFixed(1);
    return `<tr>
      <td class="num">${fmtDateShort(s.date)}</td>
      <td>${escapeHtml(s.type)}</td>
      <td>${escapeHtml(s.label || "—")}</td>
      <td class="num">${s.score}/${s.max}</td>
      <td class="num">${pct}%</td>
      <td><button class="row-del" data-action="delete-score" data-id="${s.id}" aria-label="Delete score">${TRASH_SVG}</button></td>
    </tr>`;
  }

  function scoreChartSVG(scores) {
    if (!scores.length) return '<div class="list-empty">No scores logged yet.</div>';
    const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
    const pts = sorted.map(s => ({ pct: Math.max(0, Math.min(100, (s.score / s.max) * 100)), date: s.date }));
    const W = 640, H = 180, padL = 30, padR = 12, padT = 14, padB = 10;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const stepX = pts.length > 1 ? innerW / (pts.length - 1) : 0;
    const coords = pts.map((p, i) => [padL + stepX * i, padT + innerH - (p.pct / 100) * innerH]);
    const path = coords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
    const grid = [0, 25, 50, 75, 100].map(v => {
      const y = padT + innerH - (v / 100) * innerH;
      return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#1c2842" stroke-width="1"/>` +
        `<text x="${padL - 6}" y="${(y + 3).toFixed(1)}" font-size="9" fill="#626e85" text-anchor="end" font-family="IBM Plex Mono, monospace">${v}</text>`;
    }).join("");
    const dots = coords.map((c, i) =>
      `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="3.2" fill="#e2a03f"><title>${pts[i].date}: ${pts[i].pct.toFixed(0)}%</title></circle>`
    ).join("");
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Score trend chart">${grid}<path d="${path}" fill="none" stroke="#e2a03f" stroke-width="2"/>${dots}</svg>`;
  }

  function renderTests() {
    const tbody = document.querySelector("#scoreTable tbody");
    const rows = [...state.tests.scores].sort((a, b) => b.date.localeCompare(a.date));
    tbody.innerHTML = rows.length ? rows.map(scoreRowHTML).join("") : `<tr><td colspan="6" style="border:none;"><div class="list-empty">No scores logged yet.</div></td></tr>`;
    document.getElementById("scoreChart").innerHTML = scoreChartSVG(state.tests.scores);
  }

  /* ---------------------------------------------------------------------
     Goals & Habits
     --------------------------------------------------------------------- */

  function habitStreak(habitId) {
    const logs = state.goals.log[habitId] || {};
    return consecutiveStreak(new Set(Object.keys(logs).filter(d => logs[d])));
  }

  function renderHabitGrid() {
    const el = document.getElementById("habitGrid");
    const dates = last7Dates();
    const dayLabels = dates.map(d => new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2));
    let html = `<div class="hg-name"></div>` + dayLabels.map(l => `<div class="hg-head">${l}</div>`).join("") + `<div class="hg-head">streak</div>`;
    state.goals.habits.forEach(h => {
      const logs = state.goals.log[h.id] || {};
      html += `<div class="hg-name">${escapeHtml(h.name)} <button class="hg-row-del" data-action="delete-habit" data-id="${h.id}" aria-label="Remove ${escapeHtml(h.name)}">×</button></div>`;
      dates.forEach(d => {
        const on = !!logs[d];
        html += `<button class="hg-cell ${on ? "on" : ""}" data-action="toggle-habit" data-id="${h.id}" data-date="${d}" aria-label="${escapeHtml(h.name)} on ${d}"></button>`;
      });
      html += `<div class="hg-streak">${habitStreak(h.id)}d</div>`;
    });
    el.innerHTML = html;
  }

  function goalRowHTML(g) {
    return `<div class="row ${g.done ? "done" : ""}" data-id="${g.id}">
      <button class="row-check" data-action="toggle-goal" data-id="${g.id}" aria-label="Mark done">${CHECK_SVG}</button>
      <div class="row-body">
        <div class="row-title">${escapeHtml(g.title)}</div>
        ${g.date ? `<div class="row-meta"><span>Target ${fmtDateShort(g.date)}</span></div>` : ""}
      </div>
      <button class="row-del" data-action="delete-goal" data-id="${g.id}" aria-label="Delete goal">${TRASH_SVG}</button>
    </div>`;
  }

  function renderGoalList() {
    const items = [...state.goals.items].sort((a, b) => (a.done - b.done) || (a.date || "").localeCompare(b.date || ""));
    document.getElementById("goalList").innerHTML = items.length ? items.map(goalRowHTML).join("") : '<div class="list-empty">No goals yet — add one above.</div>';
  }

  function renderGoals() {
    renderHabitGrid();
    renderGoalList();
  }

  /* ---------------------------------------------------------------------
     Settings
     --------------------------------------------------------------------- */

  function renderSettings() {
    document.getElementById("sName").value = state.settings.name || "";
    document.getElementById("sExamDate").value = state.settings.examDate || "";
    document.getElementById("sOptional").value = state.settings.optionalSubject || "";
  }

  function updateSidebarCandidate() {
    // Sidebar is icon-only now; candidate name is shown in Settings only.
  }

  /* ---------------------------------------------------------------------
     Navigation & toast
     --------------------------------------------------------------------- */

  function renderView(name) {
    switch (name) {
      case "dashboard": renderDashboard(); break;
      case "syllabus": renderSyllabus(); break;
      case "planner": renderPlanner(); break;
      case "affairs": renderAffairs(document.getElementById("caFilter").value); break;
      case "tests": renderTests(); break;
      case "goals": renderGoals(); break;
      case "settings": renderSettings(); break;
    }
  }

  function setView(name) {
    if (!VIEWS.includes(name)) return;
    VIEWS.forEach(v => document.getElementById("view-" + v).classList.toggle("active", v === name));
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    state.ui.lastView = name;
    saveState();
    renderView(name);
    window.scrollTo(0, 0);
  }

  function stepView(delta) {
    const i = VIEWS.indexOf(state.ui.lastView);
    const next = VIEWS[(i + delta + VIEWS.length) % VIEWS.length];
    setView(next);
  }

  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------------------------------------------------------------------
     Event wiring
     --------------------------------------------------------------------- */

  function wireGlobalClicks() {
    document.addEventListener("click", (e) => {
      const gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) { e.preventDefault(); setView(gotoEl.dataset.goto); return; }

      const el = e.target.closest("[data-action]");
      if (!el) return;
      const action = el.dataset.action;

      if (action === "toggle-paper") {
        const key = el.dataset.paper;
        state.ui.openPapers[key] = !state.ui.openPapers[key];
        el.closest(".paper-block").classList.toggle("open");
        saveState();
        return;
      }
      if (action === "toggle-topic") {
        const paper = state.syllabus.find(p => p.key === el.dataset.paper);
        const t = paper.topics.find(x => x.id === el.dataset.topic);
        t.done = !t.done;
        saveState();
        const topicEl = el.closest(".topic");
        if (topicEl) topicEl.classList.toggle("done", t.done);
        updatePaperHeader(el.dataset.paper);
        updateOverallUI();
        return;
      }
      if (action === "cycle-rev") {
        const paper = state.syllabus.find(p => p.key === el.dataset.paper);
        const t = paper.topics.find(x => x.id === el.dataset.topic);
        t.rev = (t.rev + 1) % 4;
        saveState();
        el.textContent = t.rev > 0 ? `rev ×${t.rev}` : "revise";
        el.className = "rev-btn" + (t.rev > 0 ? ` r${Math.min(t.rev, 3)}` : "");
        return;
      }
      if (action === "delete-topic") {
        const paper = state.syllabus.find(p => p.key === el.dataset.paper);
        paper.topics = paper.topics.filter(x => x.id !== el.dataset.topic);
        saveState();
        renderPaperBody(el.dataset.paper);
        updatePaperHeader(el.dataset.paper);
        updateOverallUI();
        return;
      }
      if (action === "add-topic") { addTopic(el.dataset.paper); return; }

      if (action === "toggle-task") {
        const t = state.planner.tasks.find(x => x.id === el.dataset.id);
        t.done = !t.done;
        saveState();
        renderPlanner();
        if (document.getElementById("view-dashboard").classList.contains("active")) renderDashboard();
        return;
      }
      if (action === "delete-task") {
        state.planner.tasks = state.planner.tasks.filter(x => x.id !== el.dataset.id);
        saveState();
        renderPlanner();
        return;
      }

      if (action === "delete-ca") {
        state.affairs.entries = state.affairs.entries.filter(x => x.id !== el.dataset.id);
        saveState();
        renderAffairs(document.getElementById("caFilter").value);
        return;
      }

      if (action === "delete-score") {
        state.tests.scores = state.tests.scores.filter(x => x.id !== el.dataset.id);
        saveState();
        renderTests();
        return;
      }

      if (action === "toggle-goal") {
        const g = state.goals.items.find(x => x.id === el.dataset.id);
        g.done = !g.done;
        saveState();
        renderGoalList();
        return;
      }
      if (action === "delete-goal") {
        state.goals.items = state.goals.items.filter(x => x.id !== el.dataset.id);
        saveState();
        renderGoalList();
        return;
      }
      if (action === "toggle-habit") {
        const id = el.dataset.id, date = el.dataset.date;
        state.goals.log[id] = state.goals.log[id] || {};
        if (state.goals.log[id][date]) delete state.goals.log[id][date]; else state.goals.log[id][date] = true;
        saveState();
        renderHabitGrid();
        return;
      }
      if (action === "delete-habit") {
        state.goals.habits = state.goals.habits.filter(h => h.id !== el.dataset.id);
        delete state.goals.log[el.dataset.id];
        saveState();
        renderHabitGrid();
        return;
      }
      if (action === "add-habit") {
        const name = window.prompt("Habit name:");
        if (name && name.trim()) {
          state.goals.habits.push({ id: uid(), name: name.trim() });
          saveState();
          renderHabitGrid();
        }
        return;
      }

      if (action === "delete-session") {
        state.studyLog.sessions = state.studyLog.sessions.filter(x => x.id !== el.dataset.id);
        saveState();
        renderDashboard();
        return;
      }
    });

    document.addEventListener("input", (e) => {
      if (e.target.dataset && e.target.dataset.action === "note-topic") {
        const paper = state.syllabus.find(p => p.key === e.target.dataset.paper);
        const t = paper.topics.find(x => x.id === e.target.dataset.topic);
        t.note = e.target.value;
        saveState();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches("[data-add-input]")) {
        e.preventDefault();
        addTopic(e.target.dataset.addInput);
      }
    });
  }

  function wireNav() {
    document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
    document.getElementById("prevViewBtn").addEventListener("click", () => stepView(-1));
    document.getElementById("nextViewBtn").addEventListener("click", () => stepView(1));
  }

  function wireForms() {
    document.getElementById("quickLogForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = document.getElementById("qlSubject").value.trim();
      const minutes = parseInt(document.getElementById("qlMinutes").value, 10);
      const note = document.getElementById("qlNote").value.trim();
      if (!subject || !minutes) return;
      state.studyLog.sessions.push({ id: uid(), date: todayISO(), subject, minutes, note });
      saveState();
      e.target.reset();
      renderDashboard();
      toast("Session logged");
    });

    document.getElementById("taskForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("tTitle").value.trim();
      const date = document.getElementById("tDate").value;
      const subject = document.getElementById("tSubject").value.trim();
      const priority = document.getElementById("tPriority").value;
      if (!title || !date) return;
      state.planner.tasks.push({ id: uid(), title, date, subject, priority, done: false });
      saveState();
      e.target.reset();
      document.getElementById("tDate").value = todayISO();
      renderPlanner();
      toast("Task added");
    });

    document.getElementById("caForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("caTitle").value.trim();
      const date = document.getElementById("caDate").value;
      const category = document.getElementById("caCategory").value;
      const notes = document.getElementById("caNotes").value.trim();
      if (!title || !date) return;
      state.affairs.entries.unshift({ id: uid(), title, date, category, notes });
      saveState();
      e.target.reset();
      document.getElementById("caDate").value = todayISO();
      renderAffairs(document.getElementById("caFilter").value);
      toast("Entry added");
    });
    document.getElementById("caFilter").addEventListener("change", (e) => renderAffairs(e.target.value));

    document.getElementById("testForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const date = document.getElementById("tsDate").value;
      const type = document.getElementById("tsType").value;
      const label = document.getElementById("tsLabel").value.trim();
      const score = parseFloat(document.getElementById("tsScore").value);
      const max = parseFloat(document.getElementById("tsMax").value);
      if (!date || isNaN(score) || isNaN(max) || max <= 0) return;
      state.tests.scores.push({ id: uid(), date, type, label, score, max });
      saveState();
      e.target.reset();
      document.getElementById("tsDate").value = todayISO();
      renderTests();
      toast("Score added");
    });

    document.getElementById("goalForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("gTitle").value.trim();
      const date = document.getElementById("gDate").value;
      if (!title) return;
      state.goals.items.push({ id: uid(), title, date, done: false });
      saveState();
      e.target.reset();
      renderGoalList();
      toast("Goal added");
    });

    document.getElementById("settingsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      state.settings.name = document.getElementById("sName").value.trim();
      state.settings.examDate = document.getElementById("sExamDate").value;
      state.settings.optionalSubject = document.getElementById("sOptional").value.trim();

      let msg = "Settings saved";
      if (state.settings.optionalSubject) {
        const filled = ensureOptionalPapers(state.settings.optionalSubject);
        const known = findOptionalSyllabus(state.settings.optionalSubject);
        if (filled && known) msg = `Settings saved — ${state.settings.optionalSubject} syllabus added`;
        else if (filled) msg = "Settings saved — optional split into Paper I & II";
      }

      saveState();
      updateSidebarCandidate();
      if (document.getElementById("view-syllabus").classList.contains("active")) renderSyllabus();
      toast(msg);
    });
  }

  function wireDataTools() {
    document.getElementById("exportBtn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `base-camp-backup-${todayISO()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Backup downloaded");
    });

    document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());

    document.getElementById("importFile").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed || typeof parsed !== "object") throw new Error("invalid");
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          loadState();
          renderView(state.ui.lastView || "dashboard");
          updateSidebarCandidate();
          toast("Backup imported");
        } catch (err) {
          window.alert("That file couldn't be read as a Base Camp backup.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      if (!window.confirm("This will permanently delete everything stored in this browser for Base Camp. Continue?")) return;
      localStorage.removeItem(STORAGE_KEY);
      loadState();
      updateSidebarCandidate();
      setView("dashboard");
      toast("All data reset");
    });
  }

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */

  function init() {
    loadState();
    document.getElementById("tDate").value = todayISO();
    document.getElementById("caDate").value = todayISO();
    document.getElementById("tsDate").value = todayISO();
    updateSidebarCandidate();
    wireNav();
    wireGlobalClicks();
    wireForms();
    wireDataTools();
    setView(state.ui.lastView || "dashboard");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
