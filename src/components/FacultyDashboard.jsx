import React, { useState, useMemo } from "react";
import {
  Users,
  ShieldAlert,
  CalendarCheck,
  GraduationCap,
  Search,
  Eye,
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

const riskColors = {
  Critical: {
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  Safe: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */
function KpiCard({ icon: Icon, iconBg, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Icon size={22} className={accent} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Recharts Tooltip                                            */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FacultyDashboard                                                   */
/* ------------------------------------------------------------------ */
export default function FacultyDashboard({ onSelectStudent }) {
  const [riskFilter, setRiskFilter] = useState("All");
  const [search, setSearch] = useState("");

  /* ---- KPI values ---- */
  const totalStudents = students.length;
  const criticalCount = students.filter(
    (s) => s.riskLevel === "Critical"
  ).length;
  const avgAttendance = round(
    students.reduce((sum, s) => sum + s.attendance, 0) / totalStudents
  );
  const avgCgpa = round(
    students.reduce((sum, s) => sum + s.currentCgpa, 0) / totalStudents,
    2
  );

  /* ---- Chart data: average attendance per subject ---- */
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

  /* ---- Chart data: Mid-1 vs Mid-2 class averages per subject ---- */
  const midScoresData = useMemo(() => {
    const map = {};
    students.forEach((s) =>
      s.subjects.forEach((sub) => {
        if (!map[sub.name])
          map[sub.name] = { mid1Total: 0, mid2Total: 0, count: 0 };
        map[sub.name].mid1Total += sub.mid1;
        map[sub.name].mid2Total += sub.mid2;
        map[sub.name].count += 1;
      })
    );
    return Object.entries(map).map(([name, { mid1Total, mid2Total, count }]) => ({
      subject: name,
      "Mid-1 Avg": round(mid1Total / count),
      "Mid-2 Avg": round(mid2Total / count),
    }));
  }, []);

  /* ---- Filtered & searched student list ---- */
  const filteredStudents = useMemo(() => {
    let list = students;
    if (riskFilter !== "All") {
      list = list.filter((s) => s.riskLevel === riskFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q)
      );
    }
    return list;
  }, [riskFilter, search]);

  const filters = ["All", "Critical", "Medium", "Safe"];

  /* ---- Render ---- */
  return (
    <div className="space-y-6">
      {/* ========== KPI ROW ========== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          iconBg="bg-indigo-50"
          accent="text-indigo-600"
          label="Total Students Monitored"
          value={totalStudents}
        />
        <KpiCard
          icon={ShieldAlert}
          iconBg="bg-red-50"
          accent="text-red-600"
          label="Critical Risk"
          value={criticalCount}
        />
        <KpiCard
          icon={CalendarCheck}
          iconBg="bg-sky-50"
          accent="text-sky-600"
          label="Avg. Attendance"
          value={`${avgAttendance}%`}
        />
        <KpiCard
          icon={GraduationCap}
          iconBg="bg-emerald-50"
          accent="text-emerald-600"
          label="Avg. CGPA"
          value={avgCgpa}
        />
      </div>

      {/* ========== CHARTS ROW ========== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* --- Subject Attendance Bar Chart --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Average Attendance by Subject
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={subjectAttendanceData}
              margin={{ top: 0, right: 12, bottom: 0, left: -12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="avgAttendance"
                name="Avg Attendance %"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- Mid-1 vs Mid-2 Grouped Bar Chart --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Mid-1 vs Mid-2 Class Averages
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={midScoresData}
              margin={{ top: 0, right: 12, bottom: 0, left: -12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 30]}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="Mid-1 Avg"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                barSize={30}
              />
              <Bar
                dataKey="Mid-2 Avg"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========== STUDENT RISK DIRECTORY ========== */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header / Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Risk filter pills */}
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors
                  ${
                    riskFilter === f
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search name or roll no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Roll No</th>
                <th className="px-5 py-3 font-semibold">Section</th>
                <th className="px-5 py-3 font-semibold">Attendance</th>
                <th className="px-5 py-3 font-semibold">CGPA</th>
                <th className="px-5 py-3 font-semibold">Risk Level</th>
                <th className="px-5 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No students match your filters.
                  </td>
                </tr>
              )}

              {filteredStudents.map((s) => {
                const risk = riskColors[s.riskLevel] ?? riskColors.Safe;
                return (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {s.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.rollNo}</td>
                    <td className="px-5 py-3 text-slate-600">{s.section}</td>
                    <td
                      className={`px-5 py-3 font-semibold ${
                        s.attendance < 75 ? "text-red-600" : "text-slate-700"
                      }`}
                    >
                      {s.attendance}%
                    </td>
                    <td className="px-5 py-3 text-slate-700">{s.currentCgpa}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${risk.badge}`}
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${risk.dot}`}
                        />
                        {s.riskLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => onSelectStudent?.(s)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
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
      </div>
    </div>
  );
}
