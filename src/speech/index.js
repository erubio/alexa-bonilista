const speechCache = require('./cache')

module.exports.getSpeechNewsletterPart = (bonilistaIndex, bonilistaPart) => {
  return speechCache.getSpeechContent(bonilistaIndex, bonilistaPart);
};

module.exports.getSpeechNewsletter = (bonilistaIndex) => {
  if (bonilistaIndex === 10) {
    return texts.helpTenWeeksAgo;
  } else if (bonilistaIndex > 10) {
    return texts.helpText;
  } else {
    return speechCache.getSpeechContent(bonilistaIndex, 0) || texts.helpText;
  }
};

module.exports.getSpeechNewsletterTitles = () => {
  return speechCache.getSpeechTitles();
};
