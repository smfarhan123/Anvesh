import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Layout from "./components/Layout";
import FacultyDashboard from "./components/FacultyDashboard";
import StudentPortalView from "./components/StudentPortalView";
import StudentDetailModal from "./components/StudentDetailModal";
import AIAdvisorModal from "./components/AIAdvisorModal";

export default function App() {
  /* ---- Theme state (Dark/Light mode) ---- */
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  /* ---- Auth state ---- */
  const [currentUser, setCurrentUser] = useState(null);
  // currentUser shape: { role: 'faculty' | 'student', data: { ... } } | null

  /* ---- Dashboard state ---- */
  const [view, setView] = useState("faculty");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [aiTargetStudent, setAiTargetStudent] = useState(null);

  /* ---- Handle login ---- */
  const handleLogin = (role, data) => {
    setCurrentUser({ role, data });
    // Automatically set view and active tab based on login role
    const nextView = role === "student" ? "student" : "faculty";
    setView(nextView);
    setActiveTab(role === "student" ? "My Overview" : "Overview");
  };

  /* ---- Handle logout ---- */
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudent(null);
    setAiTargetStudent(null);
    setActiveTab("Overview");
    setView("faculty");
  };

  /* ---- Handle view toggle (Faculty <-> Student) ---- */
  const handleViewChange = (newView) => {
    setView(newView);
    setActiveTab(newView === "student" ? "My Overview" : "Overview");
  };

  /* ============================================================ */
  /*  Not authenticated → Login Page                               */
  /* ============================================================ */
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  /* ============================================================ */
  /*  Authenticated → Dashboard                                    */
  /* ============================================================ */
  return (
    <Layout
      view={view}
      onViewChange={handleViewChange}
      user={currentUser}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {/* Swap content based on active view */}
      {view === "faculty" ? (
        <FacultyDashboard
          activeTab={activeTab}
          onSelectStudent={(student) => setSelectedStudent(student)}
        />
      ) : (
        <StudentPortalView
          student={currentUser.role === "student" ? currentUser.data : undefined}
          activeTab={activeTab}
        />
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onOpenAIPlan={(student) => {
            setAiTargetStudent(student);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* AI Advisor Modal */}
      {aiTargetStudent && (
        <AIAdvisorModal
          student={aiTargetStudent}
          onClose={() => setAiTargetStudent(null)}
        />
      )}
    </Layout>
  );
}