const axios = require('axios');
const User = require('../models/User');

const fetchLeetcodeStats = async (req, res) => {
  try {
    const { leetcodeUsername } = req.user;

    if (!leetcodeUsername) {
      return res.status(400).json({ message: 'LeetCode username not set in profile' });
    }

    const difficultyQuery = {
      query: `query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }`,
      variables: { username: leetcodeUsername },
    };

    const topicQuery = {
      query: `query skillStats($username: String!) {
        matchedUser(username: $username) {
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
        }
      }`,
      variables: { username: leetcodeUsername },
    };

    const [difficultyRes, topicRes] = await Promise.all([
      axios.post('https://leetcode.com/graphql', difficultyQuery),
      axios.post('https://leetcode.com/graphql', topicQuery),
    ]);

    const difficultyData = difficultyRes.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const tagData = topicRes.data.data.matchedUser.tagProblemCounts;

    const difficultyCount = {};
    difficultyData.forEach((item) => {
      difficultyCount[item.difficulty] = item.count;
    });

    const topicCount = {};
    [...tagData.fundamental, ...tagData.intermediate, ...tagData.advanced].forEach((tag) => {
      topicCount[tag.tagName] = tag.problemsSolved;
    });

    const stats = {
      difficultyCount,
      topicCount,
      lastUpdated: new Date(),
    };

    req.user.leetcodeStats = stats;
    await req.user.save();

    res.status(200).json({
      message: 'LeetCode stats fetched successfully',
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { fetchLeetcodeStats };