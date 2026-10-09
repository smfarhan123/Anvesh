import React, { useState } from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Grid3X3,
  BotMessageSquare,
  Activity,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */
const navItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "at-risk", label: "At-Risk Students", icon: AlertTriangle },
  { key: "heatmap", label: "Subject Heatmap", icon: Grid3X3 },
  { key: "advisor", label: "AI Advisor", icon: BotMessageSquare },
];

/* ------------------------------------------------------------------ */
/*  Semester options                                                    */
/* ------------------------------------------------------------------ */
const semesters = [
  "Semester 4 - Spring 2026",
  "Semester 3 - Fall 2025",
];

/* ------------------------------------------------------------------ */
/*  Layout Component                                                   */
/* ------------------------------------------------------------------ */
export default function Layout({
  children,
  view: viewProp,
  onViewChange,
  user,
  onLogout,
  activeTab: activeTabProp,
  setActiveTab: setActiveTabProp,
}) {
  const [activeNavInternal, setActiveNavInternal] = useState("overview");
  const [semester, setSemester] = useState(semesters[0]);
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [viewInternal, setViewInternal] = useState("faculty");

  // Use controlled props if provided, otherwise fall back to internal state
  const view = viewProp ?? viewInternal;
  const setView = onViewChange ?? setViewInternal;
  const activeNav = activeTabProp ?? activeNavInternal;
  const setActiveNav = setActiveTabProp ?? setActiveNavInternal;

  // Derive display name and subtitle from user prop
  const displayName =
    user?.role === "faculty"
      ? user.data?.name || "Faculty"
      : user?.data?.name || "Student";
  const displaySub =
    user?.role === "faculty"
      ? "Faculty"
      : user?.data?.rollNo || "Student";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* ============================================================ */}
      {/*  LEFT SIDEBAR                                                 */}
      {/* ============================================================ */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        {/* --- Brand Header --- */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            AcademiPulse
          </span>
        </div>

        {/* --- Navigation --- */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = activeNav === key;
            return (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                )}

                <Icon
                  size={18}
                  className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {/* --- Sidebar Footer (optional branding) --- */}
        <div className="border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-400">© 2026 AcademiPulse</p>
        </div>
      </aside>

      {/* ============================================================ */}
      {/*  MAIN COLUMN                                                  */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* --- Top Navigation Bar --- */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          {/* Left side — Semester selector */}
          <div className="relative">
            <button
              onClick={() => setSemesterOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              {semester}
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${semesterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {semesterOpen && (
              <ul className="absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {semesters.map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => {
                        setSemester(s);
                        setSemesterOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors
                        ${
                          s === semester
                            ? "bg-indigo-50 font-medium text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right side — View toggle + Profile + Sign Out */}
          <div className="flex items-center gap-5">
            {/* View Toggle Pill */}
            <div className="flex rounded-full border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setView("faculty")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors
                  ${
                    view === "faculty"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Faculty View
              </button>
              <button
                onClick={() => setView("student")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors
                  ${
                    view === "student"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Student View
              </button>
            </div>

            {/* Logged-in User Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <User size={18} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-700">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400">{displaySub}</p>
              </div>
            </div>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-600"
                title="Sign Out"
              >
                <LogOut size={14} />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* --- Content Area --- */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
