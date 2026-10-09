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
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    text: "text-emerald-700",
    Icon: ShieldCheck,
  },
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: "text-amber-600",
    text: "text-amber-700",
    Icon: ShieldAlert,
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50",
    icon: "text-red-600",
    text: "text-red-700",
    Icon: ShieldAlert,
  },
};

const bannerMsg = {
  green: (att) =>
    `Your attendance (${att}%) is above 75% — you are eligible to appear for end-semester exams without condonation.`,
  amber: (att) =>
    `Your attendance is ${att}% (below 75%). You must apply for CAC (College Academic Committee) condonation before the end-semester exams. Contact your mentor immediately to initiate the process.`,
  red: (att) =>
    `⛔ Your attendance (${att}%) is below 65%. You are at risk of detention/debarment. This cannot be condoned under JNTUH norms. Speak to your Head of Department urgently.`,
};

/* ------------------------------------------------------------------ */
/*  Trend badge                                                        */
/* ------------------------------------------------------------------ */
function TrendBadge({ v1, v2 }) {
  const d = v2 - v1;
  if (d > 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        <TrendingUp size={13} /> +{d}
      </span>
    );
  if (d < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
        <TrendingDown size={13} /> {d}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
      <Minus size={13} /> 0
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  End-sem target calculator                                          */
/* ------------------------------------------------------------------ */
function endSemTarget(cia30) {
  // Pass criteria (JNTUH):
  //   1. Minimum 35% in end-sem → 25/70
  //   2. Minimum 40% aggregate (CIA + End-sem) → 40/100
  const minEndSem = 25; // 35% of 70
  const minAggregate = 40;
  const neededForAggregate = Math.max(0, minAggregate - cia30);
  const target = Math.max(minEndSem, neededForAggregate);
  return Math.min(target, 70); // cap at 70
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function StudentPortalView({ student: studentProp }) {
  const student = studentProp || DEFAULT_STUDENT;

  /* ---- Attendance recovery simulator ---- */
  const [totalUpcoming, setTotalUpcoming] = useState(30);
  const [planToAttend, setPlanToAttend] = useState(30);

  // Current assumed total classes (back-calculate from attendance%)
  // attendance = (attended / totalSoFar) * 100
  // We approximate totalSoFar as a round number; use 100 as a reasonable semester base
  const totalSoFar = 100;
  const attendedSoFar = Math.round((student.attendance / 100) * totalSoFar);

  const projectedAtt = useMemo(() => {
    const newTotal = totalSoFar + totalUpcoming;
    const newAttended = attendedSoFar + planToAttend;
    return Number(((newAttended / newTotal) * 100).toFixed(1));
  }, [totalUpcoming, planToAttend, attendedSoFar]);

  const projectedCat = getAttendanceCategory(projectedAtt);

  /* ---- Attendance category ---- */
  const attCat = getAttendanceCategory(student.attendance);
  const banner = bannerStyles[attCat.color];
  const BannerIcon = banner.Icon;

  /* ---- CIA data ---- */
  const subjectCIA = student.subjects.map((sub) => ({
    ...sub,
    cia: calculateTheoryInternal(sub),
  }));

  /* ---- Mock recovery plan ---- */
  const mockPlan = {
    week1:
      "Attend every lecture without exception. Begin 45-minute daily revision of your weakest subject. Meet your mentor for an initial counseling session.",
    week2:
      "Complete practice problem sets for all subjects with CIA below 15/30. Attend peer-tutoring sessions. Maintain 100% attendance to boost cumulative percentage.",
    week3:
      "Take self-assessment mock tests. Review results with your mentor. Build a realistic end-semester exam study schedule.",
  };

  return (
    <div className="space-y-6">
      {/* ========== STUDENT HEADER CARD ========== */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <UserCircle size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {student.name}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {student.rollNo} &middot; {student.section} &middot; B.Tech
                CSE
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Mentor: {student.mentor || "Not Assigned"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2">
              <CalendarCheck size={16} className="text-sky-600" />
              <span className="text-sm text-slate-600">
                Attendance:{" "}
                <span
                  className={`font-bold ${
                    attCat.color === "green"
                      ? "text-slate-800"
                      : attCat.color === "amber"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {student.attendance}%
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2">
              <GraduationCap size={16} className="text-indigo-600" />
              <span className="text-sm text-slate-600">
                CGPA:{" "}
                <span className="font-bold text-slate-800">
                  {student.currentCgpa}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Attendance status banner */}
        <div
          className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${banner.border} ${banner.bg}`}
        >
          <BannerIcon size={20} className={`shrink-0 ${banner.icon}`} />
          <p className={`text-sm font-medium ${banner.text}`}>
            {bannerMsg[attCat.color](student.attendance)}
          </p>
        </div>
      </div>

      {/* ========== ATTENDANCE RECOVERY SIMULATOR ========== */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-800">
            Attendance Recovery Simulator
          </h2>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            What-If
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Controls */}
          <div className="space-y-4">
            {/* Total upcoming classes */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Total upcoming classes remaining
              </label>
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
              <div className="mt-1 text-right text-sm font-semibold text-slate-700">
                {totalUpcoming} classes
              </div>
            </div>

            {/* Classes you'll attend */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Classes I plan to attend
              </label>
              <input
                type="range"
                min={0}
                max={totalUpcoming}
                value={planToAttend}
                onChange={(e) => setPlanToAttend(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="mt-1 text-right text-sm font-semibold text-slate-700">
                {planToAttend} / {totalUpcoming}
              </div>
            </div>
          </div>

          {/* Projected result */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Projected Attendance
            </p>
            <p
              className={`mt-1 text-4xl font-extrabold ${
                projectedCat.color === "green"
                  ? "text-emerald-600"
                  : projectedCat.color === "amber"
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {projectedAtt}%
            </p>
            <span
              className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${
                projectedCat.color === "green"
                  ? "bg-emerald-100 text-emerald-700"
                  : projectedCat.color === "amber"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {projectedCat.label}
            </span>
            {projectedAtt >= 75 && student.attendance < 75 && (
              <p className="mt-2 text-center text-xs font-medium text-emerald-600">
                ✅ You'll cross the safe 75% threshold!
              </p>
            )}
            {projectedAtt < 75 && (
              <p className="mt-2 text-center text-xs text-slate-500">
                You need to attend{" "}
                <span className="font-bold text-slate-700">
                  {Math.max(
                    0,
                    Math.ceil(
                      0.75 * (totalSoFar + totalUpcoming) - attendedSoFar
                    )
                  )}
                </span>{" "}
                of {totalUpcoming} classes to reach 75%.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========== CIA BREAKDOWN + END-SEM TARGET ========== */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">
              CIA Breakdown &amp; End-Semester Target
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Scheme 2023 — Sessional 80:20 weighted ÷ 2 + Quiz average
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {subjectCIA.map((sub) => {
            const { cia } = sub;
            const target = endSemTarget(cia.totalCIA30);
            const ciaAtRisk = cia.totalCIA30 < 14;
            const subAttCat = getAttendanceCategory(sub.attendance);

            return (
              <div
                key={sub.code}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                {/* Subject header */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {sub.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{sub.code}</p>
                  </div>
                  <TrendBadge v1={sub.internal1} v2={sub.internal2} />
                </div>

                {/* Scores grid */}
                <div className="mb-3 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-slate-400">S1</p>
                    <p className="font-bold text-slate-700">
                      {sub.internal1}/40
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-slate-400">S2</p>
                    <p className="font-bold text-slate-700">
                      {sub.internal2}/40
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-slate-400">Quiz</p>
                    <p className="font-bold text-slate-700">
                      {cia.quiz10}/10
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-2 ${
                      ciaAtRisk ? "bg-red-50" : "bg-white"
                    }`}
                  >
                    <p className="text-slate-400">CIA</p>
                    <p
                      className={`font-bold ${
                        ciaAtRisk ? "text-red-600" : "text-indigo-700"
                      }`}
                    >
                      {cia.totalCIA30}/30
                    </p>
                  </div>
                </div>

                {/* Attendance + End-sem target */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-medium ${
                      subAttCat.color === "green"
                        ? "text-emerald-600"
                        : subAttCat.color === "amber"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    Attendance: {sub.attendance}%
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Target size={13} className="text-indigo-500" />
                    Need {target}/70 in End-Sem
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== AI RECOVERY PLAN ========== */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" />
          <h2 className="text-sm font-bold text-indigo-800">
            Your AI Recovery Plan
          </h2>
          <span className="rounded-full bg-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
            Active
          </span>
        </div>

        <div className="space-y-3">
          {[
            { tag: "Week 1", body: mockPlan.week1 },
            { tag: "Week 2", body: mockPlan.week2 },
            { tag: "Week 3", body: mockPlan.week3 },
          ].map(({ tag, body }) => (
            <div key={tag} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-fit shrink-0 rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-bold leading-snug text-white">
                {tag}
              </span>
              <p className="text-sm leading-relaxed text-indigo-700">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
