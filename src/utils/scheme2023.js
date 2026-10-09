/**
 * GPREC Scheme 2023 — Academic Rules Utility
 *
 * Theory CIA (Continuous Internal Assessment) breakdown:
 *   Sessional (20 marks) = weighted from two internals (each out of 40)
 *     → betterScore × 0.8 + otherScore × 0.2, then ÷ 2
 *   Quiz (10 marks) = average of two quizzes (each out of 10)
 *   Total CIA = sessional20 + quiz10 → out of 30
 *
 * Attendance thresholds (JNTUH / GPREC):
 *   ≥ 75%  → Eligible Regular
 *   65–74% → Condonation Required (CAC approval)
 *   < 65%  → Detained / Debarred (non-condonable)
 */

/* ------------------------------------------------------------------ */
/*  calculateTheoryInternal                                            */
/* ------------------------------------------------------------------ */
/**
 * Computes the CIA score for a theory subject under Scheme 2023.
 *
 * @param {{ internal1: number, internal2: number, quiz1: number, quiz2: number }} sub
 * @returns {{
 *   betterScore: number,
 *   otherScore: number,
 *   weightedSessional: number,
 *   sessional20: number,
 *   quiz10: number,
 *   totalCIA30: number
 * }}
 */
export function calculateTheoryInternal(sub) {
  // ---------- validation ----------
  if (sub.internal1 > 40 || sub.internal2 > 40) {
    throw new RangeError(
      `Internal marks must be ≤ 40. Received internal1=${sub.internal1}, internal2=${sub.internal2}`
    );
  }
  if (sub.quiz1 > 10 || sub.quiz2 > 10) {
    throw new RangeError(
      `Quiz marks must be ≤ 10. Received quiz1=${sub.quiz1}, quiz2=${sub.quiz2}`
    );
  }

  // ---------- sessional (out of 20) ----------
  const betterScore = Math.max(sub.internal1, sub.internal2);
  const otherScore = Math.min(sub.internal1, sub.internal2);
  const weightedSessional = Number(
    (betterScore * 0.8 + otherScore * 0.2).toFixed(2)
  );
  const sessional20 = Number((weightedSessional / 2).toFixed(2));

  // ---------- quiz (out of 10) ----------
  const quiz10 = Number(((sub.quiz1 + sub.quiz2) / 2).toFixed(2));

  // ---------- total CIA (out of 30) ----------
  const totalCIA30 = Number((sessional20 + quiz10).toFixed(2));

  return {
    betterScore,
    otherScore,
    weightedSessional,
    sessional20,
    quiz10,
    totalCIA30,
  };
}

/* ------------------------------------------------------------------ */
/*  getAttendanceCategory                                              */
/* ------------------------------------------------------------------ */
/**
 * Returns the attendance eligibility category under GPREC / JNTUH norms.
 *
 * @param {number} att — overall or subject attendance percentage
 * @returns {{
 *   label: string,
 *   color: "green" | "amber" | "red",
 *   condonationRequired: boolean,
 *   debarred: boolean
 * }}
 */
export function getAttendanceCategory(att) {
  if (att >= 75) {
    return {
      label: "Eligible Regular",
      color: "green",
      condonationRequired: false,
      debarred: false,
    };
  }

  if (att >= 65) {
    return {
      label: "Condonation Required (CAC)",
      color: "amber",
      condonationRequired: true,
      debarred: false,
    };
  }

  return {
    label: "Debarred / Detained (< 65%)",
    color: "red",
    condonationRequired: false,
    debarred: true,
  };
}
