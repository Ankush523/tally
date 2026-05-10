/** Utility copy under day score — factual, scannable (not marketing voice). */
export function formatScoreInsight(
  score: number,
  weekBest: number,
  habitsLeft: number,
): string {
  const to70 = 70 - score;
  if (score < 70 && to70 > 0 && habitsLeft > 0) {
    return `~${to70} pts to 70 · add a habit or task`;
  }
  if (weekBest > score && weekBest > 0) {
    return `Week high ${weekBest} · ${weekBest - score} pts to match`;
  }
  if (score >= 85) {
    return `High score — keep momentum`;
  }
  if (habitsLeft === 0) {
    return `Habits done for today · score still tracks tasks & focus`;
  }
  return `${habitsLeft} habit${habitsLeft === 1 ? '' : 's'} open`;
}
