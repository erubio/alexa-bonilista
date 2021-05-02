const texts = require("../../resources/texts");
const { getFeed } = require("../feed");

let speechCache = [];
const CACHE_TIME = 12 * 60 * 60 * 1000; //12 hour

const generateFeedSpeach = (info) => {
  const processedSpeach = [];
  info.content.forEach((content, index) => {
    if (info.content.length > 1) {
      const randomContinue = parseInt(Math.random() * 5);
      if (index === 0) {
        processedSpeach.push(
          `${info.title}${texts.longPause}${content}${texts.longPause}${texts['askContinue' + randomContinue]}`
        );
      } else if (index < info.content.length - 1) {
        processedSpeach.push(
          `${content}${texts.longPause}${texts['askContinue' + randomContinue]}`
        );
      } else {
        processedSpeach.push(
          `${content}${texts.longPause}${texts.endBonilista}`
        );
      }
    } else {
      processedSpeach.push(
        `${info.title}${texts.longPause}${info.content}${texts.longPause}${texts.endBonilista}`
      );
    }
  });
  return processedSpeach;
};

const cacheFeeds = (feed) => {
  speechCache = feed.map((f) => {
    return {
      content: generateFeedSpeach(f),
      releaseDate: f.releaseDate,
      title: f.title,
    };
  });
};

const getTextTitleByWeek = (i, title) => {
  if (i === 0) {
    return `${texts.titleThisWeek} ${title}.`;
  } else if (i === 1) {
    return `${texts.titleLastWeek} ${title}.`;
  } else {
    return `${texts.titleNWweeks.replace("{n}", i)} ${title}.`;
  }
};

module.exports.loadAndRefreshFeedCache = () => {
  getFeed().then((feed) => cacheFeeds(feed));
  setInterval(() => getFeed().then((feeds) => cacheFeeds(feeds)), CACHE_TIME);
};

module.exports.getSpeechNewsletterPart = (bonilistaIndex, bonilistaPart) => {
  if (
    speechCache[bonilistaIndex] &&
    speechCache[bonilistaIndex].content &&
    speechCache[bonilistaIndex].content[bonilistaPart]
  ) {
    return speechCache[bonilistaIndex].content[bonilistaPart];
  }
  return null;
};

module.exports.getSpeechNewsletter = (bonilistaIndex) => {
  if (bonilistaIndex > 9) {
    return texts.helpText;
  } else if (speechCache[bonilistaIndex]) {
    return speechCache[bonilistaIndex].content[0];
  }
};

module.exports.getSpeechNewsletterTitles = () => {
  const titles = speechCache.map((entry, i) =>
    getTextTitleByWeek(i, entry.title)
  );
  return `${texts.titles}${texts.pause}${titles.join(texts.longPause)}`;
};

module.exports.getSpeechNewsletterTest = (req, res) => {
  const article = req.query.article || 0;
  const part = req.query.part || 0;
  res.json({ test: speechCache[article].content[part] });
};
