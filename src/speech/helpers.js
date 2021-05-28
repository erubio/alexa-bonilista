const cache = require("./cache");
const speechCache = cache.getSpeechCache();

module.exports.getSpeechContent = (bonilistaIndex = 0, bonilistaPart = 0) => {
  if (
    speechCache.articles[bonilistaIndex] &&
    speechCache.articles[bonilistaIndex].content &&
    speechCache.articles[bonilistaIndex].content[bonilistaPart]
  ) {
    return speechCache.articles[bonilistaIndex].content[bonilistaPart];
  }
  return null;
};

module.exports.getSpeechTitles = () => {
  return speechCache.titles;
};

module.exports.getReleaseDateOfBonilista = (bonilistaIndex) => {
  if (speechCache.articles[bonilistaIndex]) {
    return speechCache.articles[bonilistaIndex].releaseDate;
  }
  return null;
};

module.exports.getIndexFromReleaseDate = (releaseDate) => {
  return speechCache.articles.find(
    (article) => article.releaseDate === releaseDate
  );
};

module.exports.getArticlesNum = () => {
  return speechCache.articles.length;
};

module.exports.getWelcomeText = () => {
  return speechCache.welcomeMessage;
};

module.exports.getHelpText = () => {
  return speechCache.helpText;
};

module.exports.getHelpMaxWeeksAgo = () => {
  return speechCache.helpMaxWeeksAgo;
};

module.exports.getHelpTextCard = () => {
  return speechCache.helpTextCard;
};
