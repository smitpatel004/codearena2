/**
 * LeetCode Service
 * Fetches stats via LeetCode's public GraphQL API
 */

const axios = require('axios');

const LEETCODE_API = 'https://leetcode.com/graphql';

const getUserStats = async (username) => {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
    }
  `;

  try {
    const { data } = await axios.post(
      LEETCODE_API,
      { query, variables: { username } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        timeout: 10000,
      }
    );

    if (!data.data || !data.data.matchedUser) {
      throw new Error(`LeetCode user "${username}" not found`);
    }

    const user = data.data.matchedUser;
    const contestData = data.data.userContestRanking;
    const submissions = user.submitStats.acSubmissionNum;

    const getCount = (difficulty) => {
      const entry = submissions.find((s) => s.difficulty === difficulty);
      return entry ? entry.count : 0;
    };

    return {
      username,
      totalSolved: getCount('All'),
      easySolved: getCount('Easy'),
      mediumSolved: getCount('Medium'),
      hardSolved: getCount('Hard'),
      ranking: user.profile?.ranking || 0,
      contestRating: contestData ? Math.round(contestData.rating) : 0,
      globalRanking: contestData?.globalRanking || 0,
      topPercentage: contestData?.topPercentage || 0,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`LeetCode user "${username}" not found`);
    }
    throw new Error(`Failed to fetch LeetCode data: ${error.message}`);
  }
};

module.exports = { getUserStats };
