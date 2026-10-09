import React from "react";
import {
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  CalendarCheck,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
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
import {
  calculateTheoryInternal,
  getAttendanceCategory,
} from "../utils/scheme2023";

/* ------------------------------------------------------------------ */
/*  Risk badge config                                                  */
/* ------------------------------------------------------------------ */
const riskStyle = {
  Critical: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  Safe: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
};
const riskDot = {
  Critical: "bg-red-500",
  Medium: "bg-amber-500",
  Safe: "bg-emerald-500",
};

/* ------------------------------------------------------------------ */
/*  Attendance status banner styles                                    */
/* ------------------------------------------------------------------ */
const attBannerStyles = {
  green: {
    wrapper: "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
    Icon: ShieldCheck,
  },
  amber: {
    wrapper: "border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-300",
    Icon: ShieldAlert,
  },
  red: {
    wrapper: "border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-700 dark:text-red-300",
    Icon: ShieldX,
  },
};

const attBannerMessage = {
  green: (att) => `Attendance ${att}% — Eligible for regular examinations`,
  amber: (att) =>
    `Attendance ${att}% — Requires College Academic Committee (CAC) Condonation`,
  red: (att) =>
    `Attendance ${att}% — Debarred / Detained: Below 65% statutory threshold (Cannot be condoned)`,
};

/* ------------------------------------------------------------------ */
/*  Custom Recharts Tooltip                                            */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.value}/40</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trend indicator (Sessional 1 → Sessional 2)                        */
/* ------------------------------------------------------------------ */
function TrendBadge({ val1, val2 }) {
  const diff = val2 - val1;
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
        <TrendingUp size={13} /> +{diff}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/60 dark:text-red-400">
        <TrendingDown size={13} /> {diff}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Minus size={13} /> 0
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  StudentDetailModal                                                 */
/* ------------------------------------------------------------------ */
export default function StudentDetailModal({ student, onClose, onOpenAIPlan }) {
  if (!student) return null;

  /* ---- Attendance category ---- */
  const attCategory = getAttendanceCategory(student.attendance);
  const bannerStyle = attBannerStyles[attCategory.color];
  const BannerIcon = bannerStyle.Icon;

  /* ---- CIA calculations per subject ---- */
  const subjectCIA = student.subjects.map((sub) => ({
    ...sub,
    cia: calculateTheoryInternal(sub),
  }));

  /* ---- Chart data: Sessional 1 vs Sessional 2 (out of 40) ---- */
  const chartData = subjectCIA.map((sub) => ({
    subject: sub.name,
    "Sessional 1": sub.internal1,
    "Sessional 2": sub.internal2,
  }));

  const hasFlags = student.flags && student.flags.length > 0;

  return (
    /* ===== Backdrop ===== */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ===== Modal Card ===== */}
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* ====== HEADER ====== */}
        <div className="border-b border-slate-200 px-6 pb-5 pt-6 dark:border-slate-800">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {student.name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {student.rollNo} &middot; {student.section}
                {student.mentor && (
                  <span className="text-slate-400 dark:text-slate-500">
                    {" "}
                    &middot; Mentor: {student.mentor}
                  </span>
                )}
              </p>
            </div>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                riskStyle[student.riskLevel] ?? riskStyle.Safe
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  riskDot[student.riskLevel] ?? riskDot.Safe
                }`}
              />
              {student.riskLevel} Risk
            </span>
          </div>

          {/* Summary strip */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-800">
              <CalendarCheck size={16} className="text-sky-600 dark:text-sky-400" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Attendance:{" "}
                <span
                  className={`font-bold ${
                    attCategory.color === "green"
                      ? "text-slate-800 dark:text-slate-100"
                      : attCategory.color === "amber"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {student.attendance}%
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-800">
              <GraduationCap size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                CGPA:{" "}
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {student.currentCgpa}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ====== BODY ====== */}
        <div className="space-y-5 px-6 py-5">
          {/* ---- Attendance Status Banner (GPREC) ---- */}
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${bannerStyle.wrapper}`}
          >
            <BannerIcon size={20} className={`shrink-0 ${bannerStyle.icon}`} />
            <p className={`text-sm font-medium ${bannerStyle.text}`}>
              {attBannerMessage[attCategory.color](student.attendance)}
            </p>
          </div>

          {/* ---- Early Warning Flags ---- */}
          {hasFlags && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Early Warning Indicators
                </h4>
              </div>
              <ul className="space-y-1.5 pl-1">
                {student.flags.map((flag, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300"
                  >
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---- Sessional Performance Chart ---- */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Sessional Performance Trajectory (out of 40)
            </h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 12, bottom: 0, left: -12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 40]}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
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
                  dataKey="Sessional 1"
                  fill="#94a3b8"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="Sessional 2"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ---- CIA Breakdown Table (GPREC Scheme 2023) ---- */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Continuous Internal Assessment — Scheme 2023 (30 Marks)
              </h4>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                Sessional 20 = (Better×0.8 + Other×0.2) ÷ 2 &nbsp;|&nbsp; Quiz
                10 = (Q1+Q2) ÷ 2 &nbsp;|&nbsp; CIA = Sessional + Quiz
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                    <th className="px-4 py-2.5 font-semibold">Subject</th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      S1 /40
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      S2 /40
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      Weighted /40
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      Sessional /20
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      Quiz Avg /10
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      CIA /30
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      Att %
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectCIA.map((sub) => {
                    const { cia } = sub;
                    const ciaAtRisk = cia.totalCIA30 < 14;
                    const attBelow40 = sub.attendance < 40;
                    return (
                      <tr
                        key={sub.code}
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800/50"
                      >
                        {/* Subject */}
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {sub.name}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {sub.code}
                          </p>
                        </td>

                        {/* S1 */}
                        <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-300">
                          {sub.internal1}
                        </td>

                        {/* S2 */}
                        <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-300">
                          {sub.internal2}
                        </td>

                        {/* Weighted Sessional /40 */}
                        <td className="px-3 py-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                          {cia.weightedSessional}
                        </td>

                        {/* Sessional /20 */}
                        <td className="px-3 py-2.5 text-center font-medium text-slate-700 dark:text-slate-300">
                          {cia.sessional20}
                        </td>

                        {/* Quiz Avg /10 */}
                        <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-300">
                          {cia.quiz10}
                        </td>

                        {/* CIA Total /30 */}
                        <td
                          className={`px-3 py-2.5 text-center font-bold ${
                            ciaAtRisk
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {cia.totalCIA30}
                          {ciaAtRisk && (
                            <span className="ml-1 text-[10px] font-semibold text-red-500">
                              ⚠
                            </span>
                          )}
                        </td>

                        {/* Subject Attendance */}
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`text-xs font-semibold ${
                              attBelow40
                                ? "text-red-600 dark:text-red-400"
                                : sub.attendance < 65
                                ? "text-red-500 dark:text-red-400"
                                : sub.attendance < 75
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {sub.attendance}%
                            {attBelow40 && (
                              <span className="ml-0.5 text-[10px]">⛔</span>
                            )}
                          </span>
                        </td>

                        {/* Trend */}
                        <td className="px-3 py-2.5 text-center">
                          <TrendBadge
                            val1={sub.internal1}
                            val2={sub.internal2}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ====== FOOTER ====== */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
          <button
            onClick={() => onOpenAIPlan?.(student)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Zap size={16} />
            Generate AI Recovery Plan
          </button>
        </div>
      </div>
    </div>
  );
}
