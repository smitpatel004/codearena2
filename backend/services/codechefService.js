/**
 * CodeChef Service
 * Service layer with scraping support for CodeChef stats
 */

const axios = require('axios');

const getUserStats = async (username) => {
  if (username && username.includes('codechef.com')) {
    const parts = username.split('/').filter(Boolean);
    username = parts[parts.length - 1];
  }

  try {
    // Try the unofficial CodeChef API first
    const { data } = await axios.get(
      `https://codechef-api.vercel.app/handle/${username}`,
      { timeout: 10000 }
    );

    if (!data || data.status === 'Failed') {
      throw new Error(`CodeChef user "${username}" not found`);
    }

    const stars = data.stars || getStarsFromRating(data.currentRating || 0);

    return {
      username,
      currentRating: data.currentRating || 0,
      highestRating: data.highestRating || 0,
      stars,
      globalRank: data.globalRank || 0,
      countryRank: data.countryRank || 0,
      countryName: data.countryName || '',
      avatar: data.profile || '',
    };
  } catch (error) {
    // Fallback: return stub so app doesn't crash
    console.warn(`CodeChef fetch failed for ${username}: ${error.message}`);
    return {
      username,
      currentRating: 0,
      highestRating: 0,
      stars: '0★',
      globalRank: 0,
      countryRank: 0,
      countryName: '',
      avatar: '',
      error: 'CodeChef data temporarily unavailable',
    };
  }
};

const getStarsFromRating = (rating) => {
  if (rating >= 2500) return '7★';
  if (rating >= 2200) return '6★';
  if (rating >= 2000) return '5★';
  if (rating >= 1800) return '4★';
  if (rating >= 1600) return '3★';
  if (rating >= 1400) return '2★';
  return '1★';
};

module.exports = { getUserStats };
