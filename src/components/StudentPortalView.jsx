import React, { useState, useMemo } from "react";
import {
  CalendarCheck,
  GraduationCap,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  SlidersHorizontal,
  CalendarRange,
  Sparkles,
  UserCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Award,
} from "lucide-react";
import {
  calculateTheoryInternal,
  getAttendanceCategory,
} from "../utils/scheme2023";
import students from "../data/students.json";

/* ------------------------------------------------------------------ */
/*  Default student (Shaik Farhan – 239X1A05D1)                        */
/* ------------------------------------------------------------------ */
const DEFAULT_STUDENT =
  students.find((s) => s.id === "239X1A05D1") || students[0];

/* ------------------------------------------------------------------ */
/*  Attendance status banner config                                    */
/* ------------------------------------------------------------------ */
const bannerStyles = {
  green: {
    border: "border-emerald-200 dark:border-emerald-800/60",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
    Icon: ShieldCheck,
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-300",
    Icon: ShieldAlert,
  },
  red: {
    border: "border-red-200 dark:border-red-900/60",
    bg: "bg-red-50 dark:bg-red-950/40",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-700 dark:text-red-300",
    Icon: ShieldAlert,
  },
};

const bannerMsg = {
  green: (att) =>
    `Your overall attendance (${att}%) is >= 75%. You are in the Regular zone and fully eligible for end-semester examinations without condonation petitions.`,
  amber: (att) =>
    `Your attendance is ${att}% (within the 65% - 74.9% CAC Condonation range). You must submit a condonation application with legitimate medical/official proof to the College Academic Committee (CAC) through your mentor.`,
  red: (att) =>
    `⛔ Critical Alert: Your attendance (${att}%) is below the statutory 65% limit. Under JNTUH / GPREC Scheme 2023 rules, this represents non-condonable detention. Report to your Department Head and mentor immediately.`,
};

/* ------------------------------------------------------------------ */
/*  Trend badge                                                        */
/* ------------------------------------------------------------------ */
function TrendBadge({ v1, v2 }) {
  const d = v2 - v1;
  if (d > 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
        <TrendingUp size={13} /> +{d}
      </span>
    );
  if (d < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/60 dark:text-red-400">
        <TrendingDown size={13} /> {d}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Minus size={13} /> 0
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  End-sem target calculator                                          */
/* ------------------------------------------------------------------ */
function endSemTarget(cia30) {
  const minEndSem = 25; // 35% of 70
  const minAggregate = 40;
  const neededForAggregate = Math.max(0, minAggregate - cia30);
  const target = Math.max(minEndSem, neededForAggregate);
  return Math.min(target, 70);
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function StudentPortalView({ student: studentProp, activeTab }) {
  const student = studentProp || DEFAULT_STUDENT;

  // Normalize active tab
  const normTab = (activeTab || "My Overview").toLowerCase().trim();
  const isSimulator = normTab.includes("simulator") || normTab.includes("attendance");
  const isMarks = normTab.includes("marks") || normTab.includes("cia");
  const isAiPlan = normTab.includes("plan") || normTab.includes("recovery") || normTab.includes("ai");
  const isOverview = !isSimulator && !isMarks && !isAiPlan;

  /* ---- Attendance recovery simulator state ---- */
  const [totalUpcoming, setTotalUpcoming] = useState(30);
  const [planToAttend, setPlanToAttend] = useState(30);

  // Approximate base: 100 semester classes
  const totalSoFar = 100;
  const attendedSoFar = Math.round((student.attendance / 100) * totalSoFar);

  const projectedAtt = useMemo(() => {
    const newTotal = totalSoFar + totalUpcoming;
    const newAttended = attendedSoFar + planToAttend;
    return Number(((newAttended / newTotal) * 100).toFixed(1));
  }, [totalUpcoming, planToAttend, attendedSoFar]);

  const projectedCat = getAttendanceCategory(projectedAtt);

  /* ---- Attendance category & banner ---- */
  const attCat = getAttendanceCategory(student.attendance);
  const banner = bannerStyles[attCat.color];
  const BannerIcon = banner.Icon;

  /* ---- CIA data ---- */
  const subjectCIA = student.subjects.map((sub) => ({
    ...sub,
    cia: calculateTheoryInternal(sub),
  }));

  const atRiskSubjectsCount = subjectCIA.filter((s) => s.cia.totalCIA30 < 14).length;

  /* ---- Roadmap checkpoints state ---- */
  const [checklist, setChecklist] = useState({
    w1_1: true,
    w1_2: false,
    w2_1: false,
    w2_2: false,
    w3_1: false,
  });

  const toggleCheck = (id) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* ---- Shared Student Header ---- */
  const renderHeaderCard = () => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <UserCircle size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  student.riskLevel === "Critical"
                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                    : student.riskLevel === "Medium"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                }`}
              >
                {student.riskLevel} Standing
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {student.rollNo} &middot; Section {student.section} &middot; B.Tech Computer Science (Scheme 2023)
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Assigned Mentor: <span className="font-medium text-slate-600 dark:text-slate-300">{student.mentor || "Not Assigned"}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-800">
            <CalendarCheck size={16} className="text-sky-600 dark:text-sky-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Attendance:{" "}
              <span
                className={`font-bold ${
                  attCat.color === "green"
                    ? "text-slate-800 dark:text-slate-100"
                    : attCat.color === "amber"
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
              CGPA: <span className="font-bold text-slate-800 dark:text-slate-100">{student.currentCgpa}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Attendance status banner */}
      <div className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${banner.border} ${banner.bg}`}>
        <BannerIcon size={20} className={`shrink-0 ${banner.icon}`} />
        <p className={`text-sm font-medium ${banner.text}`}>{bannerMsg[attCat.color](student.attendance)}</p>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  TAB 1: MY OVERVIEW                                               */
  /* ================================================================ */
  if (isOverview) {
    return (
      <div className="space-y-6">
        {renderHeaderCard()}

        {/* Quick KPI row for student */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered Subjects</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{student.subjects.length} Theory Courses</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${atRiskSubjectsCount > 0 ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"}`}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Subjects Below CIA 14</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{atRiskSubjectsCount} Subjects</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                <CalendarCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">CAC Eligibility</p>
                <p className={`text-sm font-bold ${attCat.color === "green" ? "text-emerald-700 dark:text-emerald-400" : attCat.color === "amber" ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"}`}>
                  {attCat.label}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current CGPA</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{student.currentCgpa} / 10.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Flags / Notifications */}
        {student.flags && student.flags.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition-colors duration-200 dark:border-amber-900/60 dark:bg-amber-950/40">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Academic Standing Flags</h3>
            </div>
            <ul className="space-y-2">
              {student.flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition-colors duration-200 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Good standing! No active academic warning flags recorded for Semester 4.
            </p>
          </div>
        )}

        {/* Compact Subject Summary */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Semester 4 Subject Performance Snapshot</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Continuous Internal Assessment (Scheme 2023)</p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-slate-800">
            {subjectCIA.map((sub) => {
              const isBelowThreshold = sub.cia.totalCIA30 < 14;
              return (
                <div key={sub.code} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{sub.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{sub.code}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isBelowThreshold
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      }`}
                    >
                      CIA: {sub.cia.totalCIA30} / 30
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Attendance:{" "}
                      <strong className={sub.attendance < 75 ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}>
                        {sub.attendance}%
                      </strong>
                    </span>
                    <span>S1: {sub.internal1}/40 &middot; S2: {sub.internal2}/40</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  TAB 2: ATTENDANCE SIMULATOR                                      */
  /* ================================================================ */
  if (isSimulator) {
    return (
      <div className="space-y-6">
        {/* Compact Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Attendance Recovery Simulator</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive "What-If" calculator for {student.name} ({student.rollNo})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">Current Base:</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {student.attendance}%
            </span>
          </div>
        </div>

        {/* Full-Width Simulator */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Simulate Upcoming Attendance</h3>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
              Scheme 2023 Compliance
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Total Upcoming Classes Remaining
                  </label>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {totalUpcoming} classes
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={totalUpcoming}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalUpcoming(val);
                    if (planToAttend > val) setPlanToAttend(val);
                  }}
                  className="w-full accent-indigo-600"
                />
                <div className="mt-1 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>5 classes</span>
                  <span>30 classes</span>
                  <span>60 classes</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Classes I Commit to Attend
                  </label>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {planToAttend} of {totalUpcoming} classes
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={totalUpcoming}
                  value={planToAttend}
                  onChange={(e) => setPlanToAttend(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="mt-1 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>0 classes</span>
                  <span>{Math.round(totalUpcoming / 2)} classes</span>
                  <span>{totalUpcoming} classes (100%)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Quick Scenarios:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPlanToAttend(totalUpcoming)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    100% Attendance
                  </button>
                  <button
                    onClick={() => setPlanToAttend(Math.round(totalUpcoming * 0.85))}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    85% Attendance
                  </button>
                  <button
                    onClick={() => setPlanToAttend(Math.round(totalUpcoming * 0.75))}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    75% Attendance
                  </button>
                </div>
              </div>
            </div>

            {/* Projected result Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-800/70">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Projected Aggregate Attendance
              </p>
              <p
                className={`mt-2 text-5xl font-black ${
                  projectedCat.color === "green"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : projectedCat.color === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {projectedAtt}%
              </p>
              <span
                className={`mt-3 rounded-full px-4 py-1.5 text-xs font-bold ${
                  projectedCat.color === "green"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : projectedCat.color === "amber"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                }`}
              >
                {projectedCat.label}
              </span>

              {projectedAtt >= 75 ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                  🎉 You will cross the safe 75% threshold and sit for exams without condonation!
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  You must attend at least{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {Math.max(
                      0,
                      Math.ceil(0.75 * (totalSoFar + totalUpcoming) - attendedSoFar)
                    )}
                  </strong>{" "}
                  out of the remaining {totalUpcoming} classes to reach the safe 75% regular threshold.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Regulatory Guide Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">GPREC / JNTUH Scheme 2023 Statutory Threshold Rules</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">&gt;= 75%</span>
              <h5 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">Eligible Regular</h5>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Directly eligible for Semester End Examinations with no condonation fee or petition required.</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">65% – 74.9%</span>
              <h5 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">CAC Condonation</h5>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Requires formal application to the College Academic Committee with medical certificate and condonation fee.</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-400">&lt; 65%</span>
              <h5 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">Debarred / Detained</h5>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Non-condonable under university regulations. Student is not permitted to write end exams and must repeat.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  TAB 3: CIA & MARKS                                               */
  /* ================================================================ */
  if (isMarks) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Continuous Internal Assessment (CIA /30)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scheme 2023 Sessional &amp; Quiz breakdown with End-Semester pass targets
            </p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
            Internal 30 + End-Sem 70 = 100 Marks
          </span>
        </div>

        {/* 4 Subject Breakdown Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {subjectCIA.map((sub) => {
            const { cia } = sub;
            const target = endSemTarget(cia.totalCIA30);
            const ciaAtRisk = cia.totalCIA30 < 14;
            const subAttCat = getAttendanceCategory(sub.attendance);

            return (
              <div key={sub.code} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{sub.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{sub.code}</p>
                  </div>
                  <TrendBadge v1={sub.internal1} v2={sub.internal2} />
                </div>

                {/* Scores Grid */}
                <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Sessional 1</p>
                    <p className="mt-1 font-bold text-slate-700 dark:text-slate-200">{sub.internal1} / 40</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Sessional 2</p>
                    <p className="mt-1 font-bold text-slate-700 dark:text-slate-200">{sub.internal2} / 40</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Quizzes Avg</p>
                    <p className="mt-1 font-bold text-slate-700 dark:text-slate-200">{cia.quiz10} / 10</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${ciaAtRisk ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"}`}>
                    <p className="text-[11px] font-medium opacity-80">Total CIA</p>
                    <p className="mt-1 font-extrabold">{cia.totalCIA30} / 30</p>
                  </div>
                </div>

                {/* Sessional formula breakdown */}
                <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>80:20 Weighted Sessional: <strong>{cia.weightedSessional}/40</strong></span>
                    <span>Condensed (/20): <strong>{cia.sessional20}</strong></span>
                  </div>
                </div>

                {/* Footer metrics */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span className={`font-semibold ${subAttCat.color === "green" ? "text-emerald-700 dark:text-emerald-400" : subAttCat.color === "amber" ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"}`}>
                    Attendance: {sub.attendance}%
                  </span>
                  <span className="flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-400">
                    <Target size={14} className="text-indigo-500" />
                    Target in End-Sem: {target} / 70
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scheme 2023 Explainer */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm transition-colors duration-200 dark:border-indigo-900/50 dark:bg-indigo-950/30">
          <div className="flex items-start gap-3">
            <FileText size={20} className="mt-0.5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">How GPREC Scheme 2023 Marks are Calculated</h4>
              <p className="mt-1 text-xs text-indigo-700 leading-relaxed dark:text-indigo-300">
                • <strong>Sessional (20 Marks):</strong> The better internal exam is weighted at 80% and the other at 20% (out of 40), then halved to 20 marks.<br />
                • <strong>Quiz (10 Marks):</strong> Average of Quiz 1 and Quiz 2 (each out of 10).<br />
                • <strong>End-Semester Pass Requirement:</strong> Must score minimum 35% in End-Sem (25/70) AND reach 40% combined aggregate (CIA + End-Sem &gt;= 40/100).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  TAB 4: AI RECOVERY PLAN                                          */
  /* ================================================================ */
  if (isAiPlan) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personalized AI Academic Recovery Plan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supervised by Mentor: <strong className="text-slate-700 dark:text-slate-200">{student.mentor || "Dr. K. Govardhan Reddy"}</strong>
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            ● Active Intervention
          </span>
        </div>

        {/* Mentor Advisory Note */}
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 shadow-sm transition-colors duration-200 dark:border-teal-900/60 dark:bg-teal-950/40">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap size={18} className="text-teal-700 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-teal-900 dark:text-teal-200">Mentor Counseling &amp; Action Note</h3>
          </div>
          <p className="text-sm italic leading-relaxed text-teal-800 dark:text-teal-300">
            "{student.name}, our priority is getting your attendance safely toward the 75% threshold and reinforcing concepts in your lower CIA courses. Follow this 3-week targeted roadmap strictly. Attend all scheduled remedial classes and verify your attendance sheet with me every Friday."
          </p>
        </div>

        {/* 3-Week Roadmap Cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm transition-colors duration-200 dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">Week 1</span>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Foundation &amp; Mandatory Attendance</h4>
              </div>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Priority: Critical</span>
            </div>
            <p className="mb-3 text-sm text-indigo-800 leading-relaxed dark:text-indigo-300">
              Achieve 100% attendance across all scheduled lectures. Meet mentor to formally initiate CAC condonation paperwork if needed, and dedicate 45 minutes daily to your weakest subject fundamentals.
            </p>
            <div className="space-y-2 border-t border-indigo-200/60 pt-3 dark:border-indigo-800/60">
              <label className="flex items-center gap-2 text-xs text-indigo-900 cursor-pointer dark:text-indigo-300">
                <input
                  type="checkbox"
                  checked={checklist.w1_1}
                  onChange={() => toggleCheck("w1_1")}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className={checklist.w1_1 ? "line-through opacity-70" : ""}>
                  Attend all scheduled lectures without missing any session
                </span>
              </label>
              <label className="flex items-center gap-2 text-xs text-indigo-900 cursor-pointer dark:text-indigo-300">
                <input
                  type="checkbox"
                  checked={checklist.w1_2}
                  onChange={() => toggleCheck("w1_2")}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className={checklist.w1_2 ? "line-through opacity-70" : ""}>
                  Schedule 1-on-1 counseling meeting with {student.mentor}
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm transition-colors duration-200 dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">Week 2</span>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Problem Solving &amp; Remedial Sessions</h4>
              </div>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Priority: High</span>
            </div>
            <p className="mb-3 text-sm text-indigo-800 leading-relaxed dark:text-indigo-300">
              Complete practice problem sets for all subjects where CIA is below 15/30. Join department peer-study groups and attend any faculty-led remedial tutorials.
            </p>
            <div className="space-y-2 border-t border-indigo-200/60 pt-3 dark:border-indigo-800/60">
              <label className="flex items-center gap-2 text-xs text-indigo-900 cursor-pointer dark:text-indigo-300">
                <input
                  type="checkbox"
                  checked={checklist.w2_1}
                  onChange={() => toggleCheck("w2_1")}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className={checklist.w2_1 ? "line-through opacity-70" : ""}>
                  Complete 2 practice problem sets per subject
                </span>
              </label>
              <label className="flex items-center gap-2 text-xs text-indigo-900 cursor-pointer dark:text-indigo-300">
                <input
                  type="checkbox"
                  checked={checklist.w2_2}
                  onChange={() => toggleCheck("w2_2")}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className={checklist.w2_2 ? "line-through opacity-70" : ""}>
                  Attend department remedial tutoring session
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm transition-colors duration-200 dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">Week 3</span>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Self-Assessment Mock Tests &amp; End-Sem Prep</h4>
              </div>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Priority: Essential</span>
            </div>
            <p className="mb-3 text-sm text-indigo-800 leading-relaxed dark:text-indigo-300">
              Take timed mock tests under exam conditions to ensure you can reach the required {endSemTarget(subjectCIA[0]?.cia?.totalCIA30 || 15)}/70 marks in the End-Semester Examination.
            </p>
            <div className="space-y-2 border-t border-indigo-200/60 pt-3 dark:border-indigo-800/60">
              <label className="flex items-center gap-2 text-xs text-indigo-900 cursor-pointer dark:text-indigo-300">
                <input
                  type="checkbox"
                  checked={checklist.w3_1}
                  onChange={() => toggleCheck("w3_1")}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className={checklist.w3_1 ? "line-through opacity-70" : ""}>
                  Complete mock examination paper for each course
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
