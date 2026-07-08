const topicMapping = require('./topicMapping');

const calculateTopicScores = (codeforcesTopicCount = {}, leetcodeTopicCount = {}) => {
  const combinedScores = {};

  // Go through each unified topic in our mapping
  Object.keys(topicMapping).forEach((unifiedTopic) => {
    const rawTags = topicMapping[unifiedTopic];

    let total = 0;

    rawTags.forEach((tag) => {
      // Add count from Codeforces if this tag exists there
      if (codeforcesTopicCount[tag] !== undefined) {
        total += codeforcesTopicCount[tag];
      }
      // Add count from LeetCode if this tag exists there
      if (leetcodeTopicCount[tag] !== undefined) {
        total += leetcodeTopicCount[tag];
      }
    });

    combinedScores[unifiedTopic] = total;
  });

  return combinedScores;
};

module.exports = calculateTopicScores;