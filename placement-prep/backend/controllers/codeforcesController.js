const axios = require('axios');
const User = require('../models/User');

const fetchCodeforcesStats = async (req, res) => {
  try {
    const { codeforcesUsername } = req.user;

    if (!codeforcesUsername) {
      return res.status(400).json({ message: 'Codeforces username not set in profile' });
    }

    // Call Codeforces API
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${codeforcesUsername}`
    );

    const submissions = response.data.result;

    const problemAttempts = {};   // tracks every attempt per problem
    const solvedProblems = new Set();
    const topicCount = {};
    const topicStruggleCount = {};

    const STRUGGLE_THRESHOLD = 3; // more than 3 attempts before solving = "struggled"

    submissions.forEach((sub) => {
      const problemId = `${sub.problem.contestId}-${sub.problem.index}`;

      // Count every submission for this problem, regardless of verdict
      problemAttempts[problemId] = (problemAttempts[problemId] || 0) + 1;

      if (sub.verdict === 'OK' && !solvedProblems.has(problemId)) {
        solvedProblems.add(problemId);

        sub.problem.tags.forEach((tag) => {
          topicCount[tag] = (topicCount[tag] || 0) + 1;

          if (problemAttempts[problemId] > STRUGGLE_THRESHOLD) {
            topicStruggleCount[tag] = (topicStruggleCount[tag] || 0) + 1;
          }
        });
      }
    });

    const stats = {
      totalSolved: solvedProblems.size,
      topicCount,
      topicStruggleCount,
      lastUpdated: new Date(),
    };

    req.user.codeforcesStats = stats;
    await req.user.save();

    res.status(200).json({
      message: 'Codeforces stats fetched successfully',
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { fetchCodeforcesStats };