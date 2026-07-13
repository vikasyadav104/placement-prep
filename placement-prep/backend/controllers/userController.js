const axios = require('axios');
const User = require('../models/User'); 

const syncProfiles = async (req, res) => {
  try {
    const { leetcodeId, codeforcesId } = req.body;

    if (!leetcodeId || !codeforcesId) {
      return res.status(400).json({ message: "Both LeetCode and Codeforces IDs are required." });
    }

    const user = await User.findById(req.user._id);

    // ==========================================
    // 1. YOUR CODEFORCES LOGIC
    // ==========================================
    const cfResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${codeforcesId}`);
    if (cfResponse.data.status !== 'OK') throw new Error("Codeforces handle not found");
    
    const submissions = cfResponse.data.result;
    const problemAttempts = {};  
    const solvedProblems = new Set();
    const cfTopicCount = {};
    const topicStruggleCount = {};
    const STRUGGLE_THRESHOLD = 3; 

    submissions.forEach((sub) => {
      const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
      problemAttempts[problemId] = (problemAttempts[problemId] || 0) + 1;

      if (sub.verdict === 'OK' && !solvedProblems.has(problemId)) {
        solvedProblems.add(problemId);
        sub.problem.tags.forEach((tag) => {
          cfTopicCount[tag] = (cfTopicCount[tag] || 0) + 1;
          if (problemAttempts[problemId] > STRUGGLE_THRESHOLD) {
            topicStruggleCount[tag] = (topicStruggleCount[tag] || 0) + 1;
          }
        });
      }
    });

    user.codeforcesUsername = codeforcesId;
    user.codeforcesStats = {
      totalSolved: solvedProblems.size,
      topicCount: cfTopicCount,
      topicStruggleCount,
      lastUpdated: new Date(),
    };

    // ==========================================
    // 2. YOUR LEETCODE LOGIC
    // ==========================================
    const difficultyQuery = {
      query: `query userProblemsSolved($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count } } } }`,
      variables: { username: leetcodeId },
    };

    const topicQuery = {
      query: `query skillStats($username: String!) { matchedUser(username: $username) { tagProblemCounts { advanced { tagName problemsSolved } intermediate { tagName problemsSolved } fundamental { tagName problemsSolved } } } }`,
      variables: { username: leetcodeId },
    };

    const [difficultyRes, topicRes] = await Promise.all([
      axios.post('https://leetcode.com/graphql', difficultyQuery),
      axios.post('https://leetcode.com/graphql', topicQuery),
    ]);

    if (difficultyRes.data.errors || !difficultyRes.data.data.matchedUser) {
      throw new Error('LeetCode username not found.');
    }

    const difficultyData = difficultyRes.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const tagData = topicRes.data.data.matchedUser.tagProblemCounts;

    const difficultyCount = {};
    difficultyData.forEach((item) => { difficultyCount[item.difficulty] = item.count; });

    const lcTopicCount = {};
    [...tagData.fundamental, ...tagData.intermediate, ...tagData.advanced].forEach((tag) => {
      lcTopicCount[tag.tagName] = tag.problemsSolved;
    });

    user.leetcodeUsername = leetcodeId;
    user.leetcodeStats = {
      difficultyCount,
      topicCount: lcTopicCount,
      lastUpdated: new Date(),
    };

    // ==========================================
    // 3. SAVE AND RESPOND
    // ==========================================
    await user.save();

    res.status(200).json({
      message: 'Profiles synced and data fetched successfully!',
      stats: {
        cfSolved: user.codeforcesStats.totalSolved,
        lcSolved: difficultyCount['All'] || 0
      }
    });

  } catch (error) {
    console.error("🔥 SYNC CRASH:", error.message);
    // If it's an Axios 404 error from Codeforces, it will drop here
    res.status(404).json({ message: error.message || 'Failed to verify profiles. Check your IDs.' });
  }
};
// NEW: Fetch the logged-in user's profile and stats
const getUserProfile = async (req, res) => {
  try {
    // req.user._id comes from your protect middleware
    const user = await User.findById(req.user._id).select('-password'); // Exclude password for safety
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("🔥 PROFILE FETCH CRASH:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Don't forget to export it at the bottom!
module.exports = { syncProfiles, getUserProfile };
