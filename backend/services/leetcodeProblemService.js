const axios = require('axios');

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

/**
 * Fetches a random LeetCode problem filtered by difficulty.
 * @param {'Easy'|'Medium'|'Hard'} difficulty
 * @returns Problem object with title, content, url, etc.
 */
async function getRandomProblem(difficulty = 'Medium') {
  const query = `
    query randomQuestion($categorySlug: String, $filters: QuestionListFilterInput) {
      randomQuestion(categorySlug: $categorySlug, filters: $filters) {
        questionId
        questionFrontendId
        title
        titleSlug
        difficulty
        content
        topicTags {
          name
        }
      }
    }
  `;

  const variables = {
    categorySlug: '',
    filters: { difficulty: difficulty.toUpperCase() },
  };

  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CodexArena/1.0',
        },
        timeout: 15000,
      }
    );

    const problem = response.data?.data?.randomQuestion;
    if (!problem) {
      throw new Error('No problem returned from LeetCode');
    }

    return {
      questionId: problem.questionId,
      questionFrontendId: problem.questionFrontendId,
      title: problem.title,
      titleSlug: problem.titleSlug,
      difficulty: problem.difficulty,
      content: problem.content,
      topicTags: problem.topicTags?.map(t => t.name) || [],
      leetcodeUrl: `https://leetcode.com/problems/${problem.titleSlug}/`,
    };
  } catch (error) {
    // Fallback: if LeetCode API fails, return from curated list
    console.error('LeetCode random problem fetch failed, using curated list:', error.message);
    return getCuratedProblem(difficulty);
  }
}

/**
 * Curated fallback list of popular LeetCode problems by difficulty.
 */
const CURATED_PROBLEMS = {
  Easy: [
    { title: 'Two Sum', titleSlug: 'two-sum', questionFrontendId: '1', difficulty: 'Easy', questionId: '1', topicTags: ['Array', 'Hash Table'], leetcodeUrl: 'https://leetcode.com/problems/two-sum/' },
    { title: 'Valid Parentheses', titleSlug: 'valid-parentheses', questionFrontendId: '20', difficulty: 'Easy', questionId: '20', topicTags: ['String', 'Stack'], leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
    { title: 'Merge Two Sorted Lists', titleSlug: 'merge-two-sorted-lists', questionFrontendId: '21', difficulty: 'Easy', questionId: '21', topicTags: ['Linked List', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
    { title: 'Best Time to Buy and Sell Stock', titleSlug: 'best-time-to-buy-and-sell-stock', questionFrontendId: '121', difficulty: 'Easy', questionId: '121', topicTags: ['Array', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { title: 'Invert Binary Tree', titleSlug: 'invert-binary-tree', questionFrontendId: '226', difficulty: 'Easy', questionId: '226', topicTags: ['Tree', 'DFS', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
    { title: 'Reverse Linked List', titleSlug: 'reverse-linked-list', questionFrontendId: '206', difficulty: 'Easy', questionId: '206', topicTags: ['Linked List', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
    { title: 'Contains Duplicate', titleSlug: 'contains-duplicate', questionFrontendId: '217', difficulty: 'Easy', questionId: '217', topicTags: ['Array', 'Hash Table'], leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/' },
    { title: 'Valid Anagram', titleSlug: 'valid-anagram', questionFrontendId: '242', difficulty: 'Easy', questionId: '242', topicTags: ['Hash Table', 'String'], leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/' },
  ],
  Medium: [
    { title: 'Add Two Numbers', titleSlug: 'add-two-numbers', questionFrontendId: '2', difficulty: 'Medium', questionId: '2', topicTags: ['Linked List', 'Math'], leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/' },
    { title: 'Longest Substring Without Repeating Characters', titleSlug: 'longest-substring-without-repeating-characters', questionFrontendId: '3', difficulty: 'Medium', questionId: '3', topicTags: ['Hash Table', 'String', 'Sliding Window'], leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    { title: 'Container With Most Water', titleSlug: 'container-with-most-water', questionFrontendId: '11', difficulty: 'Medium', questionId: '11', topicTags: ['Array', 'Two Pointers', 'Greedy'], leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
    { title: '3Sum', titleSlug: '3sum', questionFrontendId: '15', difficulty: 'Medium', questionId: '15', topicTags: ['Array', 'Two Pointers', 'Sorting'], leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
    { title: 'Group Anagrams', titleSlug: 'group-anagrams', questionFrontendId: '49', difficulty: 'Medium', questionId: '49', topicTags: ['Array', 'Hash Table', 'String'], leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/' },
    { title: 'Maximum Subarray', titleSlug: 'maximum-subarray', questionFrontendId: '53', difficulty: 'Medium', questionId: '53', topicTags: ['Array', 'Divide and Conquer', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/' },
    { title: 'Binary Tree Level Order Traversal', titleSlug: 'binary-tree-level-order-traversal', questionFrontendId: '102', difficulty: 'Medium', questionId: '102', topicTags: ['Tree', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
    { title: 'Course Schedule', titleSlug: 'course-schedule', questionFrontendId: '207', difficulty: 'Medium', questionId: '207', topicTags: ['DFS', 'BFS', 'Graph', 'Topological Sort'], leetcodeUrl: 'https://leetcode.com/problems/course-schedule/' },
  ],
  Hard: [
    { title: 'Median of Two Sorted Arrays', titleSlug: 'median-of-two-sorted-arrays', questionFrontendId: '4', difficulty: 'Hard', questionId: '4', topicTags: ['Array', 'Binary Search', 'Divide and Conquer'], leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
    { title: 'Merge k Sorted Lists', titleSlug: 'merge-k-sorted-lists', questionFrontendId: '23', difficulty: 'Hard', questionId: '23', topicTags: ['Linked List', 'Divide and Conquer', 'Heap'], leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    { title: 'Trapping Rain Water', titleSlug: 'trapping-rain-water', questionFrontendId: '42', difficulty: 'Hard', questionId: '42', topicTags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'], leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
    { title: 'Word Ladder', titleSlug: 'word-ladder', questionFrontendId: '127', difficulty: 'Hard', questionId: '127', topicTags: ['Hash Table', 'String', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/word-ladder/' },
    { title: 'LRU Cache', titleSlug: 'lru-cache', questionFrontendId: '146', difficulty: 'Hard', questionId: '146', topicTags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'], leetcodeUrl: 'https://leetcode.com/problems/lru-cache/' },
    { title: 'Serialize and Deserialize Binary Tree', titleSlug: 'serialize-and-deserialize-binary-tree', questionFrontendId: '297', difficulty: 'Hard', questionId: '297', topicTags: ['Tree', 'DFS', 'BFS', 'Design', 'String'], leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
  ],
};

function getCuratedProblem(difficulty) {
  const problems = CURATED_PROBLEMS[difficulty] || CURATED_PROBLEMS.Medium;
  const idx = Math.floor(Math.random() * problems.length);
  return {
    ...problems[idx],
    content: `<p><strong>Difficulty: ${difficulty}</strong></p><p>Solve this problem on LeetCode and submit your solution link.</p>`,
  };
}

module.exports = { getRandomProblem };
