import React, { useState } from "react";
import { Activity, GraduationCap, UserCircle, LogIn } from "lucide-react";
import students from "../data/students.json";

/* ------------------------------------------------------------------ */
/*  Demo faculty presets                                                */
/* ------------------------------------------------------------------ */
const facultyPresets = [
  {
    name: "Dr. K. Govardhan Reddy",
    email: "govardhan.cse@gprec.ac.in",
    department: "CSE",
  },
  {
    name: "Dr. S. Zahoor-ul-Haq",
    email: "zahoor.cse@gprec.ac.in",
    department: "CSE",
  },
];

/* ================================================================== */
/*  LOGIN PAGE                                                         */
/* ================================================================== */
export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("faculty"); // "faculty" | "student"
  const [facultyId, setFacultyId] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  /* ---- Faculty login ---- */
  const handleFacultyLogin = (preset) => {
    const data = preset || {
      name: facultyId || "Faculty User",
      email: facultyId,
      department: "CSE",
    };
    onLogin("faculty", data);
  };

  /* ---- Student login ---- */
  const handleStudentLogin = (stu) => {
    const student =
      stu || students.find((s) => s.rollNo === studentId || s.id === studentId);
    if (student) {
      onLogin("student", student);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* ========== BRAND HEADER ========== */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <Activity size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">AcademiPulse</h1>
          <p className="mt-1 text-sm text-indigo-300">
            GPREC Portal Authentication
          </p>
        </div>

        {/* ========== CARD ========== */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
          {/* ---- Tab Selector ---- */}
          <div className="mb-6 flex rounded-xl bg-white/10 p-1">
            <button
              onClick={() => setTab("faculty")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tab === "faculty"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Faculty Portal
            </button>
            <button
              onClick={() => setTab("student")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tab === "student"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Student Portal
            </button>
          </div>

          {/* ============================================================ */}
          {/*  FACULTY TAB                                                  */}
          {/* ============================================================ */}
          {tab === "faculty" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Email / Faculty ID
                </label>
                <input
                  type="text"
                  placeholder="govardhan.cse@gprec.ac.in"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={facultyPassword}
                  onChange={(e) => setFacultyPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                onClick={() => handleFacultyLogin()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-700"
              >
                <LogIn size={16} />
                Sign In as Faculty
              </button>

              {/* Demo presets */}
              <div className="pt-2">
                <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Quick Demo Access
                </p>
                <div className="space-y-2">
                  {facultyPresets.map((f) => (
                    <button
                      key={f.email}
                      onClick={() => handleFacultyLogin(f)}
                      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-left transition-colors hover:bg-white/10"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                        <GraduationCap size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {f.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{f.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/*  STUDENT TAB                                                  */}
          {/* ============================================================ */}
          {tab === "student" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Roll Number / Student ID
                </label>
                <input
                  type="text"
                  placeholder="239X1A05D1"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                onClick={() => handleStudentLogin()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-700"
              >
                <LogIn size={16} />
                Sign In as Student
              </button>

              {/* Demo student pills */}
              <div className="pt-2">
                <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Quick Demo Access
                </p>
                <div className="space-y-2">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStudentLogin(s)}
                      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-left transition-colors hover:bg-white/10"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                        <UserCircle size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {s.rollNo} &middot; {s.section}
                        </p>
                      </div>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          s.riskLevel === "Critical"
                            ? "bg-red-500/20 text-red-400"
                            : s.riskLevel === "Medium"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {s.riskLevel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-slate-600">
          G. Pulla Reddy Engineering College (Autonomous) &middot; Kurnool
        </p>
      </div>
    </div>
  );
}
