import React, { useState, useMemo, useCallback } from "react";
import {
  Users,
  ShieldAlert,
  CalendarCheck,
  GraduationCap,
  Search,
  Eye,
  Sparkles,
  Copy,
  Check,
  BellRing,
  Loader2,
  CalendarRange,
  MessageSquareHeart,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import students from "../data/students.json";
import { calculateTheoryInternal, getAttendanceCategory } from "../utils/scheme2023";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

const riskColors = {
  Critical: {
    badge: "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  Medium: {
    badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  Safe: {
    badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
};

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */
function KpiCard({ icon: Icon, iconBg, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon size={22} className={accent} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recharts Tooltip                                                   */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Student Table (shared between Overview & At-Risk)                  */
/* ------------------------------------------------------------------ */
function StudentTable({ list, onSelectStudent }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            <th className="px-5 py-3 font-semibold">Name</th>
            <th className="px-5 py-3 font-semibold">Roll No</th>
            <th className="px-5 py-3 font-semibold">Section</th>
            <th className="px-5 py-3 font-semibold">Attendance</th>
            <th className="px-5 py-3 font-semibold">CGPA</th>
            <th className="px-5 py-3 font-semibold">Risk Level</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-10 text-center text-slate-400 dark:text-slate-500">
                No students match your filters.
              </td>
            </tr>
          )}
          {list.map((s) => {
            const risk = riskColors[s.riskLevel] ?? riskColors.Safe;
            const attCat = getAttendanceCategory(s.attendance);
            return (
              <tr
                key={s.id}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800/50"
              >
                <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{s.name}</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.rollNo}</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.section}</td>
                <td className={`px-5 py-3 font-semibold ${s.attendance < 75 ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>
                  {s.attendance}%
                </td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{s.currentCgpa}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${risk.badge}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${risk.dot}`} />
                    {s.riskLevel}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    attCat.color === "green"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : attCat.color === "amber"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                  }`}>
                    {attCat.label}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => onSelectStudent?.(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
                  >
                    <Eye size={14} />
                    Inspect
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Advisor inline fallback generator                               */
/* ------------------------------------------------------------------ */
function generateInlinePlan(s) {
  const weakest = [...s.subjects].sort(
    (a, b) => a.internal1 + a.internal2 - (b.internal1 + b.internal2)
  )[0];
  const attSentence =
    s.attendance < 65
      ? `${s.name}'s attendance of ${s.attendance}% is below the 65% statutory minimum — non-condonable detention/debarment under JNTUH norms.`
      : s.attendance < 75
      ? `${s.name}'s attendance of ${s.attendance}% requires CAC condonation. Further absence risks crossing the 65% threshold.`
      : `${s.name}'s attendance of ${s.attendance}% meets regular eligibility. Focus should be on internal marks improvement.`;
  return {
    vulnerability: `${attSentence} Performance in ${weakest.name} (${weakest.code}) is concerning — sessional scores ${weakest.internal1}/40 and ${weakest.internal2}/40.`,
    roadmap: {
      week1: `Priority attendance recovery. Begin daily revision of ${weakest.name} fundamentals. Meet mentor ${s.mentor || "faculty advisor"} for initial counseling.`,
      week2: `Practice problem sets for ${weakest.name} and subjects with CIA below 15/30. Attend peer-tutoring sessions. Aim for 100% attendance.`,
      week3: `Self-assessment mock tests for each subject. Review with mentor. Prepare end-semester exam study schedule.`,
    },
    counseling: `"${s.name}, I've been reviewing your progress and want us to work together to get you back on track. Your earlier work shows real potential, and with focused effort over the next three weeks we can improve your position significantly. Let's identify where you need support — I'm here to help, not to pressure you."`,
  };
}

/* ================================================================== */
/*  FACULTY DASHBOARD                                                  */
/* ================================================================== */
export default function FacultyDashboard({ onSelectStudent, activeTab = "overview" }) {
  const [riskFilter, setRiskFilter] = useState("All");
  const [search, setSearch] = useState("");

  /* ---- KPI values ---- */
  const totalStudents = students.length;
  const criticalCount = students.filter((s) => s.riskLevel === "Critical").length;
  const avgAttendance = round(students.reduce((sum, s) => sum + s.attendance, 0) / totalStudents);
  const avgCgpa = round(students.reduce((sum, s) => sum + s.currentCgpa, 0) / totalStudents, 2);

  /* ---- Chart: avg attendance per subject ---- */
  const subjectAttendanceData = useMemo(() => {
    const map = {};
    students.forEach((s) =>
      s.subjects.forEach((sub) => {
        if (!map[sub.name]) map[sub.name] = { total: 0, count: 0 };
        map[sub.name].total += sub.attendance;
        map[sub.name].count += 1;
      })
    );
    return Object.entries(map).map(([name, { total, count }]) => ({
      subject: name,
      avgAttendance: round(total / count),
    }));
  }, []);

  /* ---- Chart: sessional 1 vs sessional 2 class averages ---- */
  const sessionalData = useMemo(() => {
    const map = {};
    students.forEach((s) =>
      s.subjects.forEach((sub) => {
        if (!map[sub.name]) map[sub.name] = { s1: 0, s2: 0, count: 0 };
        map[sub.name].s1 += sub.internal1;
        map[sub.name].s2 += sub.internal2;
        map[sub.name].count += 1;
      })
    );
    return Object.entries(map).map(([name, { s1, s2, count }]) => ({
      subject: name,
      "Sessional 1 Avg": round(s1 / count),
      "Sessional 2 Avg": round(s2 / count),
    }));
  }, []);

  /* ---- Filtered student list ---- */
  const filteredStudents = useMemo(() => {
    let list = students;
    if (riskFilter !== "All") list = list.filter((s) => s.riskLevel === riskFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));
    }
    return list;
  }, [riskFilter, search]);

  /* ---- Subject heatmap data ---- */
  const heatmapData = useMemo(() => {
    const map = {};
    students.forEach((s) =>
      s.subjects.forEach((sub) => {
        if (!map[sub.code]) map[sub.code] = { name: sub.name, code: sub.code, attTotal: 0, s1Total: 0, s2Total: 0, atRisk: 0, count: 0 };
        const m = map[sub.code];
        m.attTotal += sub.attendance;
        m.s1Total += sub.internal1;
        m.s2Total += sub.internal2;
        const cia = calculateTheoryInternal(sub);
        if (cia.totalCIA30 < 14) m.atRisk += 1;
        m.count += 1;
      })
    );
    return Object.values(map).map((m) => ({
      ...m,
      avgAtt: round(m.attTotal / m.count),
      avgS1: round(m.s1Total / m.count),
      avgS2: round(m.s2Total / m.count),
    }));
  }, []);

  /* ---- AI Advisor state ---- */
  const [aiStudent, setAiStudent] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [aiAlertSent, setAiAlertSent] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);

  const generateAiPlan = useCallback(async (stu) => {
    setAiStudent(stu);
    setAiLoading(true);
    setAiPlan(null);
    setAiDropdownOpen(false);

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!API_KEY) {
      await new Promise((r) => setTimeout(r, 1200));
      setAiPlan(generateInlinePlan(stu));
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text:
                  `You are an empathetic college academic counselor at GPREC following B.Tech Scheme 2023.\n` +
                  `Student: ${stu.name} (Section: ${stu.section}, Mentor: ${stu.mentor})\n` +
                  `Attendance: ${stu.attendance}%, CGPA: ${stu.currentCgpa}\n` +
                  `Flags: ${stu.flags?.join("; ")}\n` +
                  `Subjects: ${JSON.stringify(stu.subjects)}\n\n` +
                  `Return ONLY valid JSON: {"vulnerability":"...","roadmap":{"week1":"...","week2":"...","week3":"..."},"counseling":"..."}`
              }],
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      setAiPlan(parsed);
    } catch {
      setAiPlan(generateInlinePlan(stu));
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleAiCopy = async () => {
    if (!aiPlan?.counseling) return;
    try {
      await navigator.clipboard.writeText(aiPlan.counseling);
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 2000);
    } catch {}
  };

  const filters = ["All", "Critical", "Medium", "Safe"];

  const normTab = (activeTab || "overview").toLowerCase().trim();
  const isAtRisk = normTab === "at-risk" || normTab === "at-risk students";
  const isHeatmap = normTab === "heatmap" || normTab === "subject heatmap";
  const isAdvisor = normTab === "advisor" || normTab === "ai advisor";
  const isOverview = normTab === "overview" || (!isAtRisk && !isHeatmap && !isAdvisor);

  /* ================================================================ */
  /*  TAB: OVERVIEW                                                    */
  /* ================================================================ */
  if (isOverview) {
    return (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Users} iconBg="bg-indigo-50 dark:bg-indigo-950/60" accent="text-indigo-600 dark:text-indigo-400" label="Total Students Monitored" value={totalStudents} />
          <KpiCard icon={ShieldAlert} iconBg="bg-red-50 dark:bg-red-950/60" accent="text-red-600 dark:text-red-400" label="Critical Risk" value={criticalCount} />
          <KpiCard icon={CalendarCheck} iconBg="bg-sky-50 dark:bg-sky-950/60" accent="text-sky-600 dark:text-sky-400" label="Avg. Attendance" value={`${avgAttendance}%`} />
          <KpiCard icon={GraduationCap} iconBg="bg-emerald-50 dark:bg-emerald-950/60" accent="text-emerald-600 dark:text-emerald-400" label="Avg. CGPA" value={avgCgpa} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Average Attendance by Subject</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectAttendanceData} margin={{ top: 0, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="avgAttendance" name="Avg Attendance %" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Sessional 1 vs Sessional 2 Class Averages</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sessionalData} margin={{ top: 0, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 40]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Sessional 1 Avg" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="Sessional 2 Avg" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Directory */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setRiskFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    riskFilter === f
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or roll no…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-950 sm:w-64"
              />
            </div>
          </div>
          <StudentTable list={filteredStudents} onSelectStudent={onSelectStudent} />
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  TAB: AT-RISK STUDENTS                                            */
  /* ================================================================ */
  if (isAtRisk) {
    const atRiskStudents = students.filter((s) => s.riskLevel === "Critical" || s.riskLevel === "Medium");
    return (
      <div className="space-y-6">
        {/* Header badge */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">At-Risk Students</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            Condonation &amp; Detention Tracking
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
            {atRiskStudents.filter((s) => s.riskLevel === "Critical").length} Critical
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            {atRiskStudents.filter((s) => s.riskLevel === "Medium").length} Medium
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard icon={ShieldAlert} iconBg="bg-red-50 dark:bg-red-950/60" accent="text-red-600 dark:text-red-400" label="Students at Risk" value={atRiskStudents.length} />
          <KpiCard icon={CalendarCheck} iconBg="bg-amber-50 dark:bg-amber-950/60" accent="text-amber-600 dark:text-amber-400" label="Need Condonation (65-75%)" value={atRiskStudents.filter((s) => s.attendance >= 65 && s.attendance < 75).length} />
          <KpiCard icon={ShieldAlert} iconBg="bg-red-50 dark:bg-red-950/60" accent="text-red-600 dark:text-red-400" label="Debarred (< 65%)" value={atRiskStudents.filter((s) => s.attendance < 65).length} />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Critical &amp; Medium Risk Students — Scheme 2023 Compliance</h3>
          </div>
          <StudentTable list={atRiskStudents} onSelectStudent={onSelectStudent} />
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  TAB: SUBJECT HEATMAP                                             */
  /* ================================================================ */
  if (isHeatmap) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Performance Heatmap</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {heatmapData.map((sub) => {
            const attDanger = sub.avgAtt < 65;
            const attWarn = sub.avgAtt < 75 && !attDanger;
            const scoreDrop = sub.avgS2 < sub.avgS1;
            return (
              <div
                key={sub.code}
                className={`rounded-xl border p-5 shadow-sm transition-colors duration-200 ${
                  attDanger
                    ? "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
                    : attWarn
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{sub.code}</p>
                  </div>
                  {sub.atRisk > 0 && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
                      {sub.atRisk} at-risk
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div
                    className={`rounded-lg p-3 ${
                      attDanger
                        ? "bg-red-100 dark:bg-red-950/60"
                        : attWarn
                        ? "bg-amber-100 dark:bg-amber-950/60"
                        : "bg-slate-50 dark:bg-slate-800"
                    }`}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Attendance</p>
                    <p className={`mt-1 text-xl font-bold ${attDanger ? "text-red-700 dark:text-red-400" : attWarn ? "text-amber-700 dark:text-amber-400" : "text-slate-800 dark:text-slate-100"}`}>
                      {sub.avgAtt}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Sessional</p>
                    <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">
                      {round((sub.avgS1 + sub.avgS2) / 2)}/40
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      scoreDrop
                        ? "bg-red-50 dark:bg-red-950/40"
                        : "bg-emerald-50 dark:bg-emerald-950/40"
                    }`}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">S1 → S2 Trend</p>
                    <p className={`mt-1 text-xl font-bold ${scoreDrop ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {scoreDrop ? "↓" : "↑"} {round(Math.abs(sub.avgS2 - sub.avgS1))}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>S1 Avg: <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.avgS1}/40</span></span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>S2 Avg: <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.avgS2}/40</span></span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>Students: <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.count}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  TAB: AI ADVISOR                                                  */
  /* ================================================================ */
  if (isAdvisor) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Advisory Command Center</h2>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">Scheme 2023</span>
        </div>

        {/* Student Selector */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Select a student to audit</p>
          <div className="relative">
            <button
              onClick={() => setAiDropdownOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
            >
              {aiStudent ? `${aiStudent.name} (${aiStudent.rollNo})` : "Choose a student…"}
              <ChevronDown size={16} className={`text-slate-400 transition-transform dark:text-slate-500 ${aiDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {aiDropdownOpen && (
              <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {students.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => generateAiPlan(s)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
                    >
                      <span>{s.name} — {s.rollNo}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.riskLevel === "Critical"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                          : s.riskLevel === "Medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      }`}>{s.riskLevel}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Loading */}
        {aiLoading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 size={36} className="animate-spin text-indigo-500" />
            <p className="mt-4 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
              Analyzing Scheme 2023 CIA marks trajectory<br />and calculating attendance buffer…
            </p>
            <div className="mt-6 w-full max-w-md space-y-3 px-8">
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-4/6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        )}

        {/* Alert banner */}
        {aiAlertSent && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
            <BellRing size={16} className="shrink-0" />
            Alert dispatched to student portal &amp; mentor desk
          </div>
        )}

        {/* Results */}
        {!aiLoading && aiPlan && aiStudent && (
          <div className="space-y-4">
            {/* Vulnerability */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/40">
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Vulnerability Assessment — {aiStudent.name}</h4>
              </div>
              <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-300">{aiPlan.vulnerability || aiPlan.vulnerabilityAssessment}</p>
            </div>

            {/* Roadmap */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/40">
              <div className="mb-3 flex items-center gap-2">
                <CalendarRange size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-200">3-Week Targeted Roadmap</h4>
              </div>
              <div className="space-y-3">
                {[
                  { tag: "Week 1", body: aiPlan.roadmap.week1 },
                  { tag: "Week 2", body: aiPlan.roadmap.week2 },
                  { tag: "Week 3", body: aiPlan.roadmap.week3 },
                ].map(({ tag, body }) => (
                  <div key={tag} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-fit shrink-0 rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-bold leading-snug text-white">{tag}</span>
                    <p className="text-sm leading-relaxed text-indigo-700 dark:text-indigo-300">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Counseling Script */}
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900/60 dark:bg-teal-950/40">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquareHeart size={18} className="text-teal-600 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-teal-800 dark:text-teal-200">Faculty Counseling Script</h4>
              </div>
              <p className="text-sm italic leading-relaxed text-teal-700 dark:text-teal-300">{aiPlan.counseling || aiPlan.counselingScript}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAiCopy}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  aiCopied
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {aiCopied ? <Check size={15} /> : <Copy size={15} />}
                {aiCopied ? "Copied!" : "Copy Script"}
              </button>
              <button
                onClick={() => { setAiAlertSent(true); setTimeout(() => setAiAlertSent(false), 3000); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <BellRing size={15} />
                Simulate Alert
              </button>
              <button
                onClick={() => generateAiPlan(aiStudent)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <Sparkles size={15} />
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!aiLoading && !aiPlan && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 dark:border-slate-700 dark:bg-slate-900">
            <Sparkles size={40} className="text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">Select a student above to generate an AI-powered intervention plan</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
