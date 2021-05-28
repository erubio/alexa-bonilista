const speechHelpers = require("./helpers");

module.exports.getSpeechNewsletterPart = (bonilistaIndex, bonilistaPart) => {
  return speechHelpers.getSpeechContent(bonilistaIndex, bonilistaPart);
};

module.exports.getSpeechNewsletter = (bonilistaIndex) => {
  const articlesNum = speechHelpers.getArticlesNum();
  
  if (bonilistaIndex === articlesNum) {
    return speechHelpers.getHelpMaxWeeksAgo();
  } else if (bonilistaIndex > articlesNum) {
    return speechHelpers.getHelpText();
  } else {
    return (
      speechHelpers.getSpeechContent(bonilistaIndex, 0) ||
      speechHelpers.getHelpText()
    );
  }
};

module.exports.getSpeechNewsletterTitles = () => {
  return speechHelpers.getSpeechTitles();
};
