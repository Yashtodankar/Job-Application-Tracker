import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const API = "http://localhost:8000/api";

const STATUS_CONFIG = {
  Applied:   { color: "#3B82F6", bg: "#1e3a5f", emoji: "📤" },
  Interview: { color: "#F59E0B", bg: "#422006", emoji: "🎤" },
  Offer:     { color: "#10B981", bg: "#052e16", emoji: "🎉" },
  Rejected:  { color: "#EF4444", bg: "#3b0000", emoji: "❌" },
};

const INTERVIEW_TYPES = ["Phone", "Video", "On-site", "Technical", "HR"];
const STATUSES = Object.keys(STATUS_CONFIG);

const EMPTY_FORM = {
  company: "", position: "", location: "", status: "Applied",
  applied_date: "", salary: "", job_url: "", notes: "",
};

const EMPTY_INTERVIEW_FORM = {
  application_id: "", interview_date: "", interview_time: "",
  interview_type: "Video", interviewer_name: "", interviewer_contact: "", notes: "",
};

async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}40`,
      borderRadius: 6, padding: "2px 10px",
      fontSize: 12, fontWeight: 700, letterSpacing: 1,
    }}>
      {cfg.emoji} {status}
    </span>
  );
}

function TypeBadge({ type }) {
  const colors = {
    Phone:      { color: "#38bdf8", bg: "#0c2340" },
    Video:      { color: "#a78bfa", bg: "#2e1065" },
    "On-site":  { color: "#34d399", bg: "#052e16" },
    Technical:  { color: "#fb923c", bg: "#431407" },
    HR:         { color: "#f472b6", bg: "#4a044e" },
  };
  const cfg = colors[type] || { color: "#94a3b8", bg: "#1e293b" };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}40`,
      borderRadius: 6, padding: "2px 10px",
      fontSize: 12, fontWeight: 700, letterSpacing: 1,
    }}>
      {type}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#111827", border: `1px solid ${color}40`,
      borderRadius: 14, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 6,
      boxShadow: `0 0 24px ${color}18`,
    }}>
      <span style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "'Syne', sans-serif" }}>{value}</span>
      <span style={{ fontSize: 13, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 18, padding: 32, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontSize: 20, color: "#f1f5f9" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
  const labelStyle = { fontSize: 12, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "block" };

  const handleSubmit = async () => {
    if (!form.company || !form.position) return alert("Company & Position are required.");
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Company *</label><input value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Google" style={inputStyle} /></div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Position *</label><input value={form.position} onChange={e => set("position", e.target.value)} placeholder="e.g. Software Engineer" style={inputStyle} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Location</label><input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Remote / NYC" style={inputStyle} /></div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Status</label><select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Applied Date</label><input type="date" value={form.applied_date} onChange={e => set("applied_date", e.target.value)} style={inputStyle} /></div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Salary / Range</label><input value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="e.g. $90k–$120k" style={inputStyle} /></div>
      </div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Job URL</label><input value={form.job_url} onChange={e => set("job_url", e.target.value)} placeholder="https://..." style={inputStyle} /></div>
      <div style={{ marginBottom: 24 }}><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ background: "none", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", padding: "10px 20px", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Save Application"}</button>
      </div>
    </div>
  );
}

function InterviewForm({ initial = EMPTY_INTERVIEW_FORM, apps = [], onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = { width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
  const labelStyle = { fontSize: 12, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "block" };

  const handleSubmit = async () => {
    if (!form.application_id) return alert("Please select an application.");
    if (!form.interview_date) return alert("Interview date is required.");
    setSaving(true);
    try { await onSave({ ...form, application_id: parseInt(form.application_id) }); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Application *</label>
        <select value={form.application_id} onChange={e => set("application_id", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">-- Select Application --</option>
          {apps.map(a => <option key={a.id} value={a.id}>{a.company} — {a.position}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Date *</label><input type="date" value={form.interview_date} onChange={e => set("interview_date", e.target.value)} style={inputStyle} /></div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Time</label><input type="time" value={form.interview_time} onChange={e => set("interview_time", e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Interview Type</label>
        <select value={form.interview_type} onChange={e => set("interview_type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Interviewer Name</label><input value={form.interviewer_name} onChange={e => set("interviewer_name", e.target.value)} placeholder="e.g. John Smith" style={inputStyle} /></div>
        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Interviewer Contact</label><input value={form.interviewer_contact} onChange={e => set("interviewer_contact", e.target.value)} placeholder="email or phone" style={inputStyle} /></div>
      </div>
      <div style={{ marginBottom: 24 }}><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Topics to prepare, questions to ask..." style={{ ...inputStyle, resize: "vertical" }} /></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ background: "none", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", padding: "10px 20px", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Save Interview"}</button>
      </div>
    </div>
  );
}

export default function App() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null);
  const [detailApp, setDetailApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overTime, setOverTime] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (search) params.set("search", search);
      const [appsData, statsData, overTimeData, topCompaniesData, interviewsData] = await Promise.all([
        apiFetch("/applications?" + params),
        apiFetch("/stats"),
        apiFetch("/stats/applications-over-time"),
        apiFetch("/stats/top-companies"),
        apiFetch("/interviews"),
      ]);
      setApps(appsData);
      setStats(statsData);
      setOverTime(overTimeData);
      setTopCompanies(topCompaniesData);
      setInterviews(interviewsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async (form) => { await apiFetch("/applications", { method: "POST", body: JSON.stringify(form) }); setModal(null); fetchAll(); };
  const handleEdit = async (form) => { await apiFetch(`/applications/${modal.edit.id}`, { method: "PUT", body: JSON.stringify(form) }); setModal(null); setDetailApp(null); fetchAll(); };
  const handleDelete = async (id) => { if (!confirm("Delete this application?")) return; await apiFetch(`/applications/${id}`, { method: "DELETE" }); setDetailApp(null); fetchAll(); };
  const handleAddInterview = async (form) => { await apiFetch("/interviews", { method: "POST", body: JSON.stringify(form) }); setModal(null); fetchAll(); };
  const handleEditInterview = async (form) => { await apiFetch(`/interviews/${modal.editInterview.id}`, { method: "PUT", body: JSON.stringify(form) }); setModal(null); fetchAll(); };
  const handleDeleteInterview = async (id) => { if (!confirm("Delete this interview?")) return; await apiFetch(`/interviews/${id}`, { method: "DELETE" }); fetchAll(); };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = interviews.filter(i => i.interview_date >= today).sort((a, b) => a.interview_date.localeCompare(b.interview_date));
  const past = interviews.filter(i => i.interview_date < today).sort((a, b) => b.interview_date.localeCompare(a.interview_date));

  const sidebarBtn = (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 10, cursor: "pointer",
    border: "none", width: "100%", textAlign: "left", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    fontWeight: active ? 700 : 400, background: active ? "rgba(99,102,241,0.2)" : "none",
    color: active ? "#a5b4fc" : "#6b7280", transition: "all 0.15s",
  });

  const InterviewCard = ({ interview, showPast = false }) => {
    const isToday = interview.interview_date === today;
    return (
      <div style={{ background: "#111827", borderRadius: 12, padding: "18px 20px", border: isToday ? "1px solid #6366f1" : "1px solid #1e293b", boxShadow: isToday ? "0 0 20px rgba(99,102,241,0.2)" : "none", opacity: showPast ? 0.7 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 16 }}>{interview.company}</div>
            <div style={{ color: "#6366f1", fontSize: 13, marginTop: 2 }}>{interview.position}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {isToday && <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, background: "rgba(99,102,241,0.15)", padding: "2px 8px", borderRadius: 6 }}>TODAY</span>}
            <TypeBadge type={interview.interview_type || "Video"} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>📅 {interview.interview_date}</span>
          {interview.interview_time && <span style={{ fontSize: 13, color: "#94a3b8" }}>🕐 {interview.interview_time}</span>}
          {interview.interviewer_name && <span style={{ fontSize: 13, color: "#94a3b8" }}>👤 {interview.interviewer_name}</span>}
          {interview.interviewer_contact && <span style={{ fontSize: 13, color: "#94a3b8" }}>📧 {interview.interviewer_contact}</span>}
        </div>
        {interview.notes && <div style={{ fontSize: 13, color: "#6b7280", background: "#0f172a", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>{interview.notes}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => setModal({ editInterview: interview })} style={{ background: "#1e293b", border: "none", borderRadius: 6, color: "#94a3b8", padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>✏️ Edit</button>
          <button onClick={() => handleDeleteInterview(interview.id)} style={{ background: "#1e293b", border: "none", borderRadius: 6, color: "#ef4444", padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>🗑️ Delete</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060b14", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .app-row:hover { background: #1e293b !important; }
        .action-btn:hover { opacity: 0.8; }
        .nav-btn:hover { color: #a5b4fc !important; background: rgba(99,102,241,0.1) !important; }
      `}</style>

      <aside style={{ width: 220, background: "#0a0f1e", borderRight: "1px solid #1e293b", padding: "28px 16px", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ marginBottom: 28, paddingLeft: 8 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 900, color: "#f1f5f9" }}>JobTrack</div>
          <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1, marginTop: 2 }}>APPLICATION MANAGER</div>
        </div>
        <button style={sidebarBtn(view === "dashboard")} className="nav-btn" onClick={() => setView("dashboard")}>📊 Dashboard</button>
        <button style={sidebarBtn(view === "list")} className="nav-btn" onClick={() => setView("list")}>📋 All Applications</button>
        <button style={sidebarBtn(view === "interviews")} className="nav-btn" onClick={() => setView("interviews")}>
          🎤 Interviews
          {upcoming.length > 0 && (
            <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 7px", fontWeight: 700 }}>
              {upcoming.length}
            </span>
          )}
        </button>
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #1e293b" }}>
          {stats && (
            <div style={{ fontSize: 12, color: "#4b5563", paddingLeft: 8, lineHeight: 1.9 }}>
              <div>Total: <span style={{ color: "#94a3b8" }}>{stats.total}</span></div>
              <div>Offers: <span style={{ color: "#10B981" }}>{stats.offer}</span></div>
              <div>Interviews: <span style={{ color: "#F59E0B" }}>{stats.interview}</span></div>
            </div>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, padding: "32px 36px", maxWidth: 1100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 900, color: "#f1f5f9" }}>
              {view === "dashboard" ? "Dashboard" : view === "list" ? "Applications" : "Interviews"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#4b5563", fontSize: 14 }}>
              {view === "dashboard" ? "Your job search overview" : view === "list" ? `${apps.length} application${apps.length !== 1 ? "s" : ""}` : `${upcoming.length} upcoming`}
            </p>
          </div>
          {view !== "interviews" ? (
            <button onClick={() => setModal("add")} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", padding: "12px 22px", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>+ Add Application</button>
          ) : (
            <button onClick={() => setModal("addInterview")} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", padding: "12px 22px", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>+ Schedule Interview</button>
          )}
        </div>

        {/* ── Dashboard ── */}
        {view === "dashboard" && stats && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 36 }}>
              <StatCard label="Total" value={stats.total} color="#6366f1" />
              <StatCard label="Applied" value={stats.applied} color="#3B82F6" />
              <StatCard label="Interview" value={stats.interview} color="#F59E0B" />
              <StatCard label="Offers" value={stats.offer} color="#10B981" />
              <StatCard label="Rejected" value={stats.rejected} color="#EF4444" />
            </div>
            {stats.total > 0 && (
              <div style={{ background: "#111827", borderRadius: 14, padding: 24, marginBottom: 28, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Pipeline Overview</div>
                <div style={{ display: "flex", height: 14, borderRadius: 8, overflow: "hidden", gap: 2 }}>
                  {STATUSES.map(s => { const val = stats[s.toLowerCase()] || 0; const pct = (val / stats.total) * 100; if (!pct) return null; return <div key={s} style={{ width: `${pct}%`, background: STATUS_CONFIG[s].color }} title={`${s}: ${val}`} />; })}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                  {STATUSES.map(s => <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_CONFIG[s].color }} />{s} ({stats[s.toLowerCase()] || 0})</div>)}
                </div>
              </div>
            )}
            <div style={{ background: "#111827", borderRadius: 14, padding: 24, border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Recent Applications</div>
              {stats.recent.length === 0 && <p style={{ color: "#4b5563", fontSize: 14 }}>No applications yet. Add your first one!</p>}
              {stats.recent.map(r => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
                  <div><div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 15 }}>{r.company}</div><div style={{ color: "#6b7280", fontSize: 13 }}>{r.position}</div></div>
                  <Badge status={r.status} />
                </div>
              ))}
              {stats.recent.length > 0 && <button onClick={() => setView("list")} style={{ marginTop: 14, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: 0 }}>View all →</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
              <div style={{ background: "#111827", borderRadius: 14, padding: 24, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>📈 Applications Over Time</div>
                {overTime.length === 0 ? <p style={{ color: "#4b5563", fontSize: 13 }}>No date data yet.</p> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={overTime}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} /><YAxis tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} /><Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#6366f1" }} /><Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" /></BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div style={{ background: "#111827", borderRadius: 14, padding: 24, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>🏢 Top Companies Applied To</div>
                {topCompanies.length === 0 ? <p style={{ color: "#4b5563", fontSize: 13 }}>No data yet.</p> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topCompanies} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} /><YAxis dataKey="company" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} width={90} /><Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#8b5cf6" }} /><Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Applications" /></BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Applications List ── */}
        {view === "list" && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search company, position, location…" style={{ flex: 1, minWidth: 200, background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "11px 16px", color: "#e2e8f0", fontSize: 14, outline: "none" }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "11px 16px", color: "#e2e8f0", fontSize: 14, cursor: "pointer", outline: "none" }}>
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ background: "#111827", borderRadius: 14, border: "1px solid #1e293b", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1.2fr 1fr auto", padding: "12px 20px", borderBottom: "1px solid #1e293b", fontSize: 11, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase" }}>
                <span>Company</span><span>Position</span><span>Location</span><span>Status</span><span>Applied</span><span>Actions</span>
              </div>
              {loading && <div style={{ padding: 32, textAlign: "center", color: "#4b5563" }}>Loading…</div>}
              {!loading && apps.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#4b5563" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>No applications found.</div>}
              {apps.map((app, i) => (
                <div key={app.id} className="app-row" style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1.2fr 1fr auto", padding: "14px 20px", borderBottom: i < apps.length - 1 ? "1px solid #1e293b" : "none", alignItems: "center", cursor: "pointer", transition: "background 0.15s", background: "transparent" }} onClick={() => setDetailApp(app)}>
                  <div><div style={{ fontWeight: 700, color: "#f1f5f9" }}>{app.company}</div>{app.job_url && <a href={app.job_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: "#6366f1" }}>↗ View Job</a>}</div>
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>{app.position}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{app.location || "—"}</div>
                  <div><Badge status={app.status} /></div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{app.applied_date || "—"}</div>
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button className="action-btn" onClick={() => setModal({ edit: app })} style={{ background: "#1e293b", border: "none", borderRadius: 6, color: "#94a3b8", padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                    <button className="action-btn" onClick={() => handleDelete(app.id)} style={{ background: "#1e293b", border: "none", borderRadius: 6, color: "#ef4444", padding: "6px 10px", cursor: "pointer", fontSize: 13 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Interviews Page ── */}
        {view === "interviews" && (
          <>
            {interviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#4b5563" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
                <div style={{ fontSize: 16, marginBottom: 8 }}>No interviews scheduled yet.</div>
                <button onClick={() => setModal("addInterview")} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", padding: "12px 22px", cursor: "pointer", fontSize: 14, fontWeight: 700, marginTop: 8 }}>+ Schedule your first interview</button>
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>📅 Upcoming ({upcoming.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {upcoming.map(i => <InterviewCard key={i.id} interview={i} />)}
                    </div>
                  </div>
                )}
                {past.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>🕐 Past ({past.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {past.map(i => <InterviewCard key={i.id} interview={i} showPast />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* ── Modals ── */}
      {modal === "add" && <Modal title="Add Application" onClose={() => setModal(null)}><AppForm onSave={handleAdd} onCancel={() => setModal(null)} /></Modal>}
      {modal?.edit && <Modal title="Edit Application" onClose={() => setModal(null)}><AppForm initial={{ ...EMPTY_FORM, ...modal.edit, applied_date: modal.edit.applied_date || "" }} onSave={handleEdit} onCancel={() => setModal(null)} /></Modal>}
      {modal === "addInterview" && <Modal title="Schedule Interview" onClose={() => setModal(null)}><InterviewForm apps={apps} onSave={handleAddInterview} onCancel={() => setModal(null)} /></Modal>}
      {modal?.editInterview && <Modal title="Edit Interview" onClose={() => setModal(null)}><InterviewForm initial={{ ...EMPTY_INTERVIEW_FORM, ...modal.editInterview, interview_date: modal.editInterview.interview_date || "", interview_time: modal.editInterview.interview_time || "" }} apps={apps} onSave={handleEditInterview} onCancel={() => setModal(null)} /></Modal>}

      {/* ── Detail Panel ── */}
      {detailApp && (
        <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 380, background: "#0a0f1e", borderLeft: "1px solid #1e293b", padding: 28, overflowY: "auto", zIndex: 900, boxShadow: "-10px 0 40px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontSize: 16 }}>Application Detail</h3>
            <button onClick={() => setDetailApp(null)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ marginBottom: 8 }}><Badge status={detailApp.status} /></div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, margin: "12px 0 4px" }}>{detailApp.company}</h2>
          <p style={{ color: "#6366f1", margin: "0 0 20px", fontSize: 15 }}>{detailApp.position}</p>
          {[["📍 Location", detailApp.location], ["📅 Applied", detailApp.applied_date], ["💰 Salary", detailApp.salary]].map(([label, val]) => val && (
            <div key={label} style={{ marginBottom: 12, fontSize: 14 }}><span style={{ color: "#4b5563" }}>{label}: </span><span style={{ color: "#94a3b8" }}>{val}</span></div>
          ))}
          {detailApp.job_url && <a href={detailApp.job_url} target="_blank" rel="noreferrer" style={{ display: "block", marginBottom: 12, color: "#6366f1", fontSize: 14 }}>↗ View Job Posting</a>}
          <div style={{ marginTop: 20, background: "#111827", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
            <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Resume</div>
            {detailApp.resume_path ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>📄</span><span style={{ color: "#94a3b8", fontSize: 13 }}>{detailApp.resume_path.split("\\").pop().split("/").pop()}</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`http://localhost:8000/resumes/${detailApp.resume_path.split("\\").pop().split("/").pop()}`} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#6366f1", padding: "8px", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>👁️ View</a>
                  <button onClick={async () => { await fetch(`http://localhost:8000/api/applications/${detailApp.id}/resume`, { method: "DELETE" }); fetchAll(); setDetailApp({ ...detailApp, resume_path: null }); }} style={{ flex: 1, background: "#1e293b", border: "1px solid #ef444440", borderRadius: 8, color: "#ef4444", padding: "8px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>🗑️ Remove</button>
                </div>
              </div>
            ) : (
              <div>
                <input type="file" id="resumeUpload" accept=".pdf,.docx" style={{ display: "none" }} onChange={async (e) => { const file = e.target.files[0]; if (!file) return; const formData = new FormData(); formData.append("file", file); const res = await fetch(`http://localhost:8000/api/applications/${detailApp.id}/resume`, { method: "POST", body: formData }); if (res.ok) { fetchAll(); const updated = await fetch(`http://localhost:8000/api/applications/${detailApp.id}`).then(r => r.json()); setDetailApp(updated); } else { alert("Upload failed! Only PDF and Word files allowed."); } }} />
                <label htmlFor="resumeUpload" style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>📁 Upload Resume (PDF / Word)</label>
              </div>
            )}
          </div>
          {detailApp.notes && (
            <div style={{ marginTop: 20, background: "#111827", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Notes</div>
              <p style={{ margin: 0, fontSize: 14, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{detailApp.notes}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button onClick={() => { setModal({ edit: detailApp }); setDetailApp(null); }} style={{ flex: 1, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", padding: "11px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>✏️ Edit</button>
            <button onClick={() => handleDelete(detailApp.id)} style={{ flex: 1, background: "#1e293b", border: "1px solid #ef444440", borderRadius: 8, color: "#ef4444", padding: "11px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>🗑️ Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}