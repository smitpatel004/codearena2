/**
 * Skill Score Calculator
 * Generates a 0-100 score based on multi-platform coding performance
 */

/**
 * Calculate overall skill score from platform stats
 * @param {Object} leetcode - LeetCode stats
 * @param {Object} codeforces - Codeforces stats
 * @param {Object} codechef - CodeChef stats
 * @returns {number} Score between 0-100
 */
const calculateSkillScore = (leetcode = {}, codeforces = {}, codechef = {}) => {
  let score = 0;
  let components = 0;

  // ── LeetCode Component (max 40 points) ───────────────────────────────────
  if (leetcode && leetcode.totalSolved >= 0) {
    let lcScore = 0;

    // Problems solved (max 20 pts): 500+ problems = full score
    const solvedScore = Math.min((leetcode.totalSolved / 500) * 20, 20);

    // Hard problems bonus (max 10 pts): 100+ hard = full score
    const hardScore = Math.min(((leetcode.hardSolved || 0) / 100) * 10, 10);

    // Contest rating (max 10 pts): 2500+ = full score
    const contestScore = Math.min(((leetcode.contestRating || 0) / 2500) * 10, 10);

    lcScore = solvedScore + hardScore + contestScore;
    score += lcScore;
    components++;
  }

  // ── Codeforces Component (max 35 points) ─────────────────────────────────
  if (codeforces && codeforces.currentRating >= 0) {
    let cfScore = 0;

    // Current rating (max 25 pts): 3000+ = full score
    const ratingScore = Math.min((codeforces.currentRating / 3000) * 25, 25);

    // Max rating bonus (max 10 pts)
    const maxRatingScore = Math.min(((codeforces.maxRating || 0) / 3000) * 10, 10);

    cfScore = ratingScore + maxRatingScore;
    score += cfScore;
    components++;
  }

  // ── CodeChef Component (max 15 points) ───────────────────────────────────
  if (codechef && codechef.currentRating >= 0) {
    // Rating (max 15 pts): 2500+ = full score
    const ccScore = Math.min((codechef.currentRating / 2500) * 15, 15);
    score += ccScore;
    components++;
  }

  // ── Platform Diversity Bonus (max 10 points) ──────────────────────────────
  const diversityBonus = components * (10 / 3);
  score += diversityBonus;

  // Clamp to 0-100
  return Math.min(Math.round(score), 100);
};

/**
 * Get rank label from skill score
 */
const getSkillRank = (score) => {
  if (score >= 90) return { rank: 'Grandmaster', color: '#ff4444' };
  if (score >= 75) return { rank: 'Master', color: '#ff8800' };
  if (score >= 60) return { rank: 'Expert', color: '#aa00ff' };
  if (score >= 45) return { rank: 'Specialist', color: '#1565c0' };
  if (score >= 30) return { rank: 'Apprentice', color: '#00897b' };
  return { rank: 'Beginner', color: '#757575' };
};

module.exports = { calculateSkillScore, getSkillRank };
