import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import Layout from "./components/Layout";
import FacultyDashboard from "./components/FacultyDashboard";
import StudentPortalView from "./components/StudentPortalView";
import StudentDetailModal from "./components/StudentDetailModal";
import AIAdvisorModal from "./components/AIAdvisorModal";

export default function App() {
  /* ---- Auth state ---- */
  const [currentUser, setCurrentUser] = useState(null);
  // currentUser shape: { role: 'faculty' | 'student', data: { ... } } | null

  /* ---- Dashboard state ---- */
  const [view, setView] = useState("faculty");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [aiTargetStudent, setAiTargetStudent] = useState(null);

  /* ---- Handle login ---- */
  const handleLogin = (role, data) => {
    setCurrentUser({ role, data });
    // Automatically set view based on login role
    setView(role === "student" ? "student" : "faculty");
  };

  /* ---- Handle logout ---- */
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudent(null);
    setAiTargetStudent(null);
    setView("faculty");
  };

  /* ============================================================ */
  /*  Not authenticated → Login Page                               */
  /* ============================================================ */
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  /* ============================================================ */
  /*  Authenticated → Dashboard                                    */
  /* ============================================================ */
  return (
    <Layout
      view={view}
      onViewChange={setView}
      user={currentUser}
      onLogout={handleLogout}
    >
      {/* Swap content based on active view */}
      {view === "faculty" ? (
        <FacultyDashboard
          onSelectStudent={(student) => setSelectedStudent(student)}
        />
      ) : (
        <StudentPortalView
          student={currentUser.role === "student" ? currentUser.data : undefined}
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