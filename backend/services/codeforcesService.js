/**
 * Codeforces Service
 * Uses official public Codeforces REST API
 */

const axios = require('axios');

const CF_API = 'https://codeforces.com/api';

const getUserStats = async (username) => {
  if (username && username.includes('codeforces.com')) {
    const parts = username.split('/').filter(Boolean);
    username = parts[parts.length - 1];
  }

  try {
    const [userRes, ratingRes] = await Promise.allSettled([
      axios.get(`${CF_API}/user.info?handles=${username}`, { timeout: 10000 }),
      axios.get(`${CF_API}/user.rating?handle=${username}`, { timeout: 10000 }),
    ]);

    if (userRes.status === 'rejected' || userRes.value.data.status !== 'OK') {
      throw new Error(`Codeforces user "${username}" not found`);
    }

    const user = userRes.value.data.result[0];
    const ratingHistory =
      ratingRes.status === 'fulfilled' && ratingRes.value.data.status === 'OK'
        ? ratingRes.value.data.result
        : [];

    return {
      username,
      currentRating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      maxRank: user.maxRank || 'unrated',
      contribution: user.contribution || 0,
      friendsCount: user.friendOfCount || 0,
      avatar: user.avatar || '',
      ratingHistory: ratingHistory.map((r) => ({
        contestId: r.contestId,
        contestName: r.contestName,
        rank: r.rank,
        oldRating: r.oldRating,
        newRating: r.newRating,
        ratingChange: r.newRating - r.oldRating,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString(),
      })),
    };
  } catch (error) {
    throw new Error(`Failed to fetch Codeforces data: ${error.message}`);
  }
};

module.exports = { getUserStats };
