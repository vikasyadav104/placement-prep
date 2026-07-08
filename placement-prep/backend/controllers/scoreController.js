const calculateTopicScores = require('../utils/scoreCalculator');

const getTopicScores = async (req, res) => {
  try {
    const codeforcesTopicCount = req.user.codeforcesStats?.topicCount || {};
    const leetcodeTopicCount = req.user.leetcodeStats?.topicCount || {};

    const combinedScores = calculateTopicScores(codeforcesTopicCount, leetcodeTopicCount);

    // Find topics with the lowest practice volume (bottom 3), framed neutrally
    const sortedTopics = Object.entries(combinedScores).sort((a, b) => a[1] - b[1]);
    const lowExposureTopics = sortedTopics.slice(0, 3).map(([topic, count]) => ({
      topic,
      solvedCount: count,
    }));

    res.status(200).json({
      message: 'Topic scores calculated successfully',
      combinedScores,
      lowExposureTopics,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTopicScores };