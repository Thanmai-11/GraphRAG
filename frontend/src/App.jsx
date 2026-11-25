import { useState } from "react";
import {
  Activity, BookOpen, BrainCircuit, ChevronDown, CircleHelp,
  Database, FileUp, GitBranch, LayoutDashboard, Search, Settings,
  Sparkles, Users, Network, ArrowUpRight, Send, Plus, Menu,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, Tooltip, XAxis,
} from "recharts";
import "./index.css";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Research Chat", icon: BrainCircuit },
  { label: "Graph Explorer", icon: Network },
  { label: "Document Ingestion", icon: FileUp },
  { label: "Investigations", icon: GitBranch },
];

const activityData = [
  { day: "Mon", value: 3 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 4 },
  { day: "Thu", value: 8 },
  { day: "Fri", value: 6 },
  { day: "Sat", value: 10 },
  { day: "Sun", value: 8 },
];

const researchers = [
  { name: "Alice", detail: "MIT · 1 paper", type: "Researcher", color: "purple" },
  { name: "Bob", detail: "Stanford University · 1 paper", type: "Researcher", color: "blue" },
  { name: "Carol", detail: "MIT · Collaborator", type: "Researcher", color: "pink" },
  { name: "GraphRAG Basics", detail: "Published 2025", type: "Paper", color: "green" },
  { name: "Knowledge Graph Applications", detail: "Published 2024", type: "Paper", color: "orange" },
];

function App() {
  const [page, setPage] = useState("Overview");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  function askQuestion(event) {
    event.preventDefault();
    if (!question.trim()) return;

    setMessages((old) => [
      ...old,
      { role: "user", text: question },
      {
        role: "assistant",
        text: "I'm currently running in demo mode. Once the backend is connected, I'll query your research graph to find relevant entities and relationships. Try exploring Alice, MIT, or GraphRAG Basics in the Graph Explorer.",
      },
    ]);
    setQuestion("");
  }

  const metrics = [
    { label: "Researchers", value: "3", icon: Users, color: "purple", note: "People in your graph" },
    { label: "Research Papers", value: "2", icon: BookOpen, color: "blue", note: "Indexed documents" },
    { label: "Organizations", value: "2", icon: Database, color: "green", note: "Institutions identified" },
    { label: "Topics", value: "2", icon: Sparkles, color: "orange", note: "Research concepts" },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Network size={22} /></div>
          <div><strong>ResearchGraph</strong><span>INTELLIGENCE PLATFORM</span></div>
        </div>

        <div className="workspace">
          <div className="workspace-icon"><BrainCircuit size={18} /></div>
          <div><strong>Research Workspace</strong><span>Personal knowledge graph</span></div>
          <ChevronDown size={15} />
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => { setPage(label); setMobileMenu(false); }}
            >
              <Icon size={18} /><span>{label}</span>
              {label === "Research Chat" && <span className="nav-new">AI</span>}
            </button>
          ))}
        </nav>

        <div className="nav-label secondary-label">PREFERENCES</div>
        <button className={`nav-item ${page === "Settings" ? "active" : ""}`} onClick={() => setPage("Settings")}>
          <Settings size={18} /><span>Settings</span>
        </button>
        <div className="sidebar-bottom">
          <div className="status-line"><span className="status-dot" /> Demo environment</div>
          <div className="profile">
            <div className="avatar">RG</div>
            <div><strong>Researcher</strong><span>Local workspace</span></div>
            <CircleHelp size={17} />
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={21} /></button>
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="topbar-right">
            <div className="connection-status"><span className="status-dot" /> Mock mode</div>
            <button className="icon-button" title="Search"><Search size={18} /></button>
            <div className="avatar top-avatar">RG</div>
          </div>
        </header>

        <div className="page-content">
          {page === "Overview" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><Sparkles size={14} /> YOUR KNOWLEDGE, CONNECTED</div>
                  <h1>Research overview<span className="title-period">.</span></h1>
                  <p className="subtitle">Discover connections across your research landscape.</p>
                </div>
                <button className="primary-button" onClick={() => setPage("Document Ingestion")}><Plus size={17} /> Add documents</button>
              </section>

              <section className="metrics-grid">
                {metrics.map(({ label, value, icon: Icon, color, note }) => (
                  <article className="metric-card" key={label}>
                    <div className={`metric-icon ${color}`}><Icon size={20} /></div>
                    <div className="metric-label">{label}</div>
                    <div className="metric-value">{value}</div>
                    <div className="metric-note">{note}</div>
                  </article>
                ))}
              </section>

              <section className="content-grid">
                <article className="panel graph-panel">
                  <div className="panel-heading">
                    <div><h2>Knowledge graph</h2><p>How your research connects</p></div>
                    <button className="text-button" onClick={() => setPage("Graph Explorer")}>Explore graph <ArrowUpRight size={15} /></button>
                  </div>
                  <div className="graph-canvas">
                    <div className="graph-grid" />
                    <svg className="graph-lines" viewBox="0 0 500 270" preserveAspectRatio="xMidYMid meet">
                      <g stroke="currentColor" strokeOpacity=".38" strokeWidth="1.5" fill="none">
                        <path d="M250 65 L130 125 L100 205" />
                        <path d="M250 65 L365 120 L400 205" />
                        <path d="M130 125 L250 190 L365 120" />
                        <path d="M250 190 L100 205" />
                        <path d="M250 190 L400 205" />
                        <path d="M250 65 L250 190" />
                      </g>
                    </svg>
                    <div className="graph-node node-alice"><span className="node-dot purple-dot" />Alice<small>Researcher</small></div>
                    <div className="graph-node node-mit"><span className="node-dot green-dot" />MIT<small>Organization</small></div>
                    <div className="graph-node node-bob"><span className="node-dot blue-dot" />Bob<small>Researcher</small></div>
                    <div className="graph-node node-rag"><span className="node-dot orange-dot" />RAG<small>Topic</small></div>
                    <div className="graph-node node-paper"><span className="node-dot pink-dot" />GraphRAG Basics<small>Paper</small></div>
                    <div className="graph-node node-kg"><span className="node-dot blue-dot" />Knowledge Graphs<small>Topic</small></div>
                  </div>
                  <div className="graph-legend">
                    <span><i className="legend-dot purple-dot" />People</span>
                    <span><i className="legend-dot green-dot" />Organizations</span>
                    <span><i className="legend-dot orange-dot" />Topics</span>
                    <span><i className="legend-dot pink-dot" />Papers</span>
                  </div>
                </article>

                <article className="panel activity-panel">
                  <div className="panel-heading">
                    <div><h2>Graph activity</h2><p>Illustrative weekly activity</p></div>
                    <Activity size={19} className="muted-icon" />
                  </div>
                  <div className="activity-number">44 <span>operations</span></div>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityData}>
                        <defs>
                          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9b8afb" stopOpacity={0.32} />
                            <stop offset="100%" stopColor="#9b8afb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#85879b", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#171824", border: "1px solid #303144", borderRadius: 10 }} />
                        <Area type="monotone" dataKey="value" stroke="#a394ff" strokeWidth={2.5} fill="url(#activityFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-caption"><span className="chart-dot" /> Demo activity data</div>
                </article>
              </section>

              <section className="panel entities-panel">
                <div className="panel-heading">
                  <div><h2>Research entities</h2><p>Recently indexed items in your knowledge graph</p></div>
                  <button className="text-button" onClick={() => setPage("Graph Explorer")}>View all <ArrowUpRight size={15} /></button>
                </div>
                <div className="entity-list">
                  {researchers.slice(0, 4).map((item) => (
                    <div className="entity-row" key={item.name}>
                      <div className={`entity-icon ${item.color}`}>{item.type === "Paper" ? <BookOpen size={17} /> : <Users size={17} />}</div>
                      <div className="entity-info"><strong>{item.name}</strong><span>{item.detail}</span></div>
                      <span className={`type-pill ${item.color}`}>{item.type}</span>
                      <ArrowUpRight size={16} className="entity-arrow" />
                    </div>
                  ))}
                </div>
              </section>
              <div className="demo-notice"><Sparkles size={15} /><span><strong>Demo mode:</strong> Dashboard metrics, chart activity, and graph preview are illustrative until connected to your live graph database.</span></div>
            </>
          )}

          {page === "Research Chat" && (
            <section className="chat-page">
              <div className="eyebrow"><BrainCircuit size={14} /> GRAPH-POWERED ASSISTANT</div>
              <h1>Research Chat<span className="title-period">.</span></h1>
              <p className="subtitle">Ask questions that connect information across your research.</p>
              <div className="panel chat-panel">
                <div className="chat-messages">
                  {messages.length === 0 ? <div className="chat-empty"><div className="large-sparkle"><Sparkles size={26} /></div><h2>What would you like to discover?</h2><p>Ask about researchers, papers, organizations, or connected topics.</p><div className="suggestion-list">{["Who works at MIT?", "Which papers discuss RAG?", "How are researchers connected?"].map((q) => <button key={q} onClick={() => setQuestion(q)}>{q}<ArrowUpRight size={15} /></button>)}</div></div> : messages.map((m, i) => <div key={i} className={`chat-message ${m.role}`}><div className="message-role">{m.role === "user" ? "You" : "ResearchGraph AI"}</div><p>{m.text}</p></div>)}
                </div>
                <form className="chat-input-row" onSubmit={askQuestion}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question about your research graph..." /><button className="send-button" type="submit"><Send size={17} /></button></form>
                <div className="chat-footnote">Demo responses only · Live graph querying will be connected next</div>
              </div>
            </section>
          )}

          {page === "Graph Explorer" && (
            <>
              <div className="eyebrow"><Network size={14} /> KNOWLEDGE GRAPH</div><h1>Graph Explorer<span className="title-period">.</span></h1><p className="subtitle">Browse the entities available in the demo graph.</p>
              <section className="panel explorer-panel">
                <div className="explorer-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search entities..." onChange={(e) => document.querySelectorAll(".explorer-row").forEach((r) => { r.style.display = r.innerText.toLowerCase().includes(e.target.value.toLowerCase()) ? "flex" : "none"; })} /></div><span className="type-pill purple">5 entities</span></div>
                {researchers.map((item) => <div className="entity-row explorer-row" key={item.name}><div className={`entity-icon ${item.color}`}>{item.type === "Paper" ? <BookOpen size={17} /> : <Users size={17} />}</div><div className="entity-info"><strong>{item.name}</strong><span>{item.detail}</span></div><span className={`type-pill ${item.color}`}>{item.type}</span></div>)}
              </section>
              <div className="demo-notice"><Database size={15} /><span>These are sample entities based on your current research documents. The next step will load actual nodes and relationships from FalkorDB.</span></div>
            </>
          )}

          {(page === "Document Ingestion" || page === "Investigations" || page === "Settings") && (
            <>
              <div className="eyebrow"><Sparkles size={14} /> RESEARCH WORKSPACE</div><h1>{page}<span className="title-period">.</span></h1>
              <p className="subtitle">{page === "Document Ingestion" ? "Prepare research documents for your knowledge graph." : page === "Investigations" ? "Follow multi-step connections across your research." : "Configure your local research environment."}</p>
              <section className="panel placeholder-panel">
                <div className="placeholder-icon">{page === "Document Ingestion" ? <FileUp size={27} /> : page === "Investigations" ? <GitBranch size={27} /> : <Settings size={27} />}</div>
                <h2>{page === "Document Ingestion" ? "Bring your research together" : page === "Investigations" ? "Investigations are coming next" : "Local development settings"}</h2>
                <p>{page === "Document Ingestion" ? "Your existing documents folder will be connected to the backend ingestion pipeline in the next milestone." : page === "Investigations" ? "We'll build a workflow to trace relationships and explain how entities connect across multiple steps." : "The frontend currently runs in mock mode. We'll add backend health and FalkorDB connection details after the API is ready."}</p>
                {page === "Document Ingestion" && <div className="upload-placeholder"><FileUp size={23} /><strong>Document ingestion pipeline</strong><span>Next: connect documents/ to FastAPI</span></div>}
                {page === "Settings" && <div className="settings-row"><span>Frontend</span><span className="settings-value"><i className="status-dot" /> Running on Vite</span></div>}
                <button className="secondary-button" onClick={() => setPage("Overview")}>Back to overview</button>
              </section>
            </>
          )}
        </div>
        <footer className="footer"><span>ResearchGraph AI <span className="footer-separator">·</span> Local development</span><span><i className="status-dot" /> Mock data enabled</span></footer>
      </main>
    </div>
  );
}

export default App;
