import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  BellRing,
  Loader2,
  ShieldAlert,
  CalendarRange,
  MessageSquareHeart,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Build the LLM prompt                                               */
/* ------------------------------------------------------------------ */
function buildPrompt(s) {
  return (
    `You are an empathetic college academic counselor and subject expert at an engineering college following B.Tech Scheme 2023.\n` +
    `Student: ${s.name} (Section: ${s.section}, Mentor: ${s.mentor || "N/A"})\n` +
    `Overall Attendance: ${s.attendance}%\n` +
    `Current CGPA: ${s.currentCgpa}\n` +
    `Academic Flags: ${s.flags?.join("; ") || "None"}\n` +
    `Subject Performance (Internal Exam 1, Exam 2 out of 40, Quizzes out of 10): ${JSON.stringify(s.subjects)}\n\n` +
    `Generate a practical recovery action plan formatted in 3 distinct sections:\n` +
    `1. VULNERABILITY ASSESSMENT (2-3 crisp sentences highlighting primary risks like condonation/detention or declining subject marks).\n` +
    `2. 3-WEEK TARGETED ROADMAP (Week 1, Week 2, Week 3 concrete academic checkpoints).\n` +
    `3. FACULTY COUNSELING SCRIPT (A supportive, non-intimidating 2-3 sentence talking script for the faculty mentor during 1-on-1 counseling).\n\n` +
    `Return ONLY valid JSON (no markdown fences) with this exact schema:\n` +
    `{"vulnerabilityAssessment":"...","roadmap":{"week1":"...","week2":"...","week3":"..."},"counselingScript":"..."}`
  );
}

/* ------------------------------------------------------------------ */
/*  Offline / fail-safe fallback (student-aware mock)                  */
/* ------------------------------------------------------------------ */
function generateFallback(s) {
  const weakest = [...s.subjects].sort(
    (a, b) => a.internal1 + a.internal2 - (b.internal1 + b.internal2)
  )[0];

  const attSentence =
    s.attendance < 65
      ? `${s.name}'s overall attendance of ${s.attendance}% is below the 65% statutory minimum — this places the student in non-condonable detained/debarred territory under JNTUH regulations, and exam eligibility is directly at risk.`
      : s.attendance < 75
      ? `${s.name}'s attendance of ${s.attendance}% falls in the 65–75% condonation zone, requiring formal College Academic Committee (CAC) approval to appear for end-semester exams. Any further absence risks crossing the 65% non-condonable boundary.`
      : `${s.name}'s attendance of ${s.attendance}% meets the regular eligibility threshold. The primary concern lies in internal assessment performance.`;

  return {
    vulnerabilityAssessment:
      `${attSentence} ` +
      `Performance in ${weakest.name} (${weakest.code}) is particularly concerning — sessional scores of ${weakest.internal1}/40 and ${weakest.internal2}/40 indicate a trajectory that could fall below the CIA pass threshold of 14/30.`,

    roadmap: {
      week1:
        `Immediate attendance recovery: attend every scheduled lecture without exception. ` +
        `Begin daily 45-minute focused revision of ${weakest.name} fundamentals (start from unit-1 basics). ` +
        `Schedule an initial counseling meeting with mentor ${s.mentor || "faculty advisor"} and sign an attendance commitment pledge.`,
      week2:
        `Attempt practice problem sets for ${weakest.name} and all subjects with projected CIA below 15/30. ` +
        `Attend department-run peer-tutoring or remedial sessions. ` +
        `Maintain 100% attendance this week to positively impact the cumulative percentage.`,
      week3:
        `Take a timed self-assessment mock test for each subject and review answers critically. ` +
        `Meet mentor to discuss progress, revisit weak topics identified in Weeks 1–2, and finalise an end-semester exam preparation schedule. ` +
        `Submit any pending lab records or assignments to avoid further penalty.`,
    },

    counselingScript:
      `"${s.name}, I've been reviewing your academic data and I genuinely want us to work together to get you back on a strong footing. ` +
      `Your earlier work shows real capability, and with a focused effort over the next three weeks I'm confident we can make meaningful progress. ` +
      `Let's pinpoint the specific areas where you need the most support and build a realistic plan — I'm here to help, not to judge."`,
  };
}

/* ------------------------------------------------------------------ */
/*  Parse Gemini response → structured plan object                     */
/* ------------------------------------------------------------------ */
function parseResponse(raw) {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  try {
    const obj = JSON.parse(cleaned);
    if (obj.vulnerabilityAssessment && obj.roadmap && obj.counselingScript) {
      return obj;
    }
  } catch {}

  const grab = (key) => {
    const m = cleaned.match(
      new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "s")
    );
    return m?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, "\n") || null;
  };

  return {
    vulnerabilityAssessment:
      grab("vulnerabilityAssessment") ||
      "Unable to parse vulnerability assessment from the AI response.",
    roadmap: {
      week1: grab("week1") || "Focus on attendance recovery and subject fundamentals.",
      week2: grab("week2") || "Practice problem sets and attend remedial sessions.",
      week3: grab("week3") || "Self-assessment mock tests and mentor review.",
    },
    counselingScript:
      grab("counselingScript") ||
      "Schedule a supportive 1-on-1 meeting to discuss a realistic recovery plan.",
  };
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function AIAdvisorModal({ student, onClose }) {
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  /* ---- Generate / fetch plan ---- */
  const generatePlan = useCallback(async () => {
    setLoading(true);
    setPlanData(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // No API key → immediate offline fallback
    if (!apiKey) {
      console.log("No VITE_GEMINI_API_KEY found — using offline fallback.");
      await new Promise((r) => setTimeout(r, 1400));
      setPlanData(generateFallback(student));
      setLoading(false);
      return;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
      const promptText = buildPrompt(student);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
        }),
      });

      console.log("Gemini API response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Gemini API Error details:", errorData);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!text) throw new Error("Empty Gemini response");

      setPlanData(parseResponse(text));
    } catch (err) {
      console.error("Gemini API call failed, falling back to offline plan:", err);
      setPlanData(generateFallback(student));
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    if (student) generatePlan();
  }, [student, generatePlan]);

  if (!student) return null;

  /* ---- Actions ---- */
  const handleCopy = async () => {
    if (!planData?.counselingScript) return;
    try {
      await navigator.clipboard.writeText(planData.counselingScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAlert = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---- Close ---- */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* ========== HEADER ========== */}
        <div className="mb-6 flex items-start gap-3 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Academic Intervention Engine
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Personalized recovery strategy for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {student.name}
              </span>{" "}
              ({student.rollNo})
            </p>
          </div>
        </div>

        {/* ---- Green alert banner (simulated dispatch) ---- */}
        {alertSent && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
            <BellRing size={16} className="shrink-0" />
            Alert dispatched to student portal &amp; mentor desk
          </div>
        )}

        {/* ========== BODY ========== */}
        {loading ? (
          /* ---------- Loading skeleton ---------- */
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={36} className="animate-spin text-indigo-500" />
            <p className="mt-4 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
              Analyzing Scheme 2023 CIA marks trajectory
              <br />
              and calculating attendance buffer…
            </p>
            <div className="mt-6 w-full max-w-md space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-4/6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ) : (
          planData && (
            <div className="space-y-4">
              {/* ---- 1. Vulnerability Assessment (Amber) ---- */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" />
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                    Vulnerability Assessment
                  </h4>
                </div>
                <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-300">
                  {planData.vulnerabilityAssessment}
                </p>
              </div>

              {/* ---- 2. 3-Week Roadmap (Indigo) ---- */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/40">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarRange size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                    3-Week Targeted Roadmap
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    { tag: "Week 1", body: planData.roadmap.week1 },
                    { tag: "Week 2", body: planData.roadmap.week2 },
                    { tag: "Week 3", body: planData.roadmap.week3 },
                  ].map(({ tag, body }) => (
                    <div key={tag} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-fit shrink-0 rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-bold leading-snug text-white">
                        {tag}
                      </span>
                      <p className="text-sm leading-relaxed text-indigo-700 dark:text-indigo-300">
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- 3. Faculty Counseling Script (Teal) ---- */}
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900/60 dark:bg-teal-950/40">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquareHeart size={18} className="text-teal-600 dark:text-teal-400" />
                  <h4 className="text-sm font-bold text-teal-800 dark:text-teal-200">
                    Faculty Counseling Script
                  </h4>
                </div>
                <p className="text-sm italic leading-relaxed text-teal-700 dark:text-teal-300">
                  {planData.counselingScript}
                </p>
              </div>
            </div>
          )
        )}

        {/* ========== FOOTER ========== */}
        {!loading && planData && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            {/* Copy counseling script */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                copied
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied!" : "Copy Counseling Script"}
            </button>

            {/* Simulate alert */}
            <button
              onClick={handleAlert}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <BellRing size={15} />
              Simulate Alert
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
