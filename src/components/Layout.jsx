import React, { useState } from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Grid,
  Sparkles,
  Calculator,
  BookOpen,
  Activity,
  ChevronDown,
  User,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Navigation items for Faculty and Student roles                     */
/* ------------------------------------------------------------------ */
const facultyNavItems = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "At-Risk Students", icon: AlertTriangle },
  { name: "Subject Heatmap", icon: Grid },
  { name: "AI Advisor", icon: Sparkles },
];

const studentNavItems = [
  { name: "My Overview", icon: LayoutDashboard },
  { name: "Attendance Simulator", icon: Calculator },
  { name: "CIA & Marks", icon: BookOpen },
  { name: "AI Recovery Plan", icon: Sparkles },
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
  darkMode,
  setDarkMode,
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

  // Determine role and active nav items
  const isStudent = user?.role === "student" || view === "student";
  const navItems = isStudent ? studentNavItems : facultyNavItems;

  // Derive display name and subtitle from user prop
  const displayName =
    user?.role === "faculty"
      ? user.data?.name || "Faculty"
      : user?.data?.name || "Student";
  const displaySub =
    user?.role === "faculty"
      ? "Faculty"
      : user?.data?.rollNo || "Student";

  const isItemActive = (itemName) => {
    if (!activeNav) return false;
    const a = activeNav.toLowerCase().trim();
    const b = itemName.toLowerCase().trim();
    if (a === b) return true;
    if (itemName === "Overview" && a === "overview") return true;
    if (itemName === "At-Risk Students" && (a === "at-risk" || a === "at-risk students")) return true;
    if (itemName === "Subject Heatmap" && (a === "heatmap" || a === "subject heatmap")) return true;
    if (itemName === "AI Advisor" && (a === "advisor" || a === "ai advisor")) return true;
    if (itemName === "My Overview" && (a === "my overview" || a === "overview")) return true;
    if (itemName === "Attendance Simulator" && (a === "attendance simulator" || a === "simulator")) return true;
    if (itemName === "CIA & Marks" && (a === "cia & marks" || a === "cia" || a === "marks")) return true;
    if (itemName === "AI Recovery Plan" && (a === "ai recovery plan" || a === "recovery plan" || a === "plan")) return true;
    return false;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* ============================================================ */}
      {/*  LEFT SIDEBAR                                                 */}
      {/* ============================================================ */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        {/* --- Brand Header --- */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            AcademiPulse
          </span>
        </div>

        {/* --- Navigation --- */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.name);
            return (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                )}

                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                  }
                />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* --- Sidebar Footer (optional branding) --- */}
        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2026 AcademiPulse &middot; GPREC
          </p>
        </div>
      </aside>

      {/* ============================================================ */}
      {/*  MAIN COLUMN                                                  */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* --- Top Navigation Bar --- */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          {/* Left side — Semester selector */}
          <div className="relative">
            <button
              onClick={() => setSemesterOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
            >
              {semester}
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform dark:text-slate-500 ${
                  semesterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {semesterOpen && (
              <ul className="absolute left-0 top-full z-50 mt-1 w-full min-w-[240px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
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
                            ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right side — View toggle + Theme switcher + Profile + Sign Out */}
          <div className="flex items-center gap-4">
            {/* View Toggle Pill */}
            <div className="flex rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => {
                  setView("faculty");
                  setActiveNav("Overview");
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors
                  ${
                    view === "faculty"
                      ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                Faculty View
              </button>
              <button
                onClick={() => {
                  setView("student");
                  setActiveNav("My Overview");
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors
                  ${
                    view === "student"
                      ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                Student View
              </button>
            </div>

            {/* Dark Mode / Light Mode Switcher */}
            {setDarkMode && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45" />
                ) : (
                  <Moon size={17} className="text-slate-600 transition-transform hover:-rotate-12 dark:text-slate-300" />
                )}
              </button>
            )}

            {/* Logged-in User Avatar */}
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4 dark:border-slate-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <User size={18} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-700 dark:text-slate-200">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{displaySub}</p>
              </div>
            </div>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400"
                title="Sign Out"
              >
                <LogOut size={14} />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* --- Content Area --- */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 transition-colors duration-200 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
