const texts = require("../../resources/texts");
const { getFeed } = require("../feed");

let speechCache = [];
const CACHE_TIME = 12 * 60 * 60 * 1000; //12 hour

const generateFeedSpeach = (info) => {
  const processedSpeach = [];
  info.content.forEach((content, index) => {
    if (info.content.length > 1) {
      if (index === 0) {
        processedSpeach.push(
          `${info.title}${texts.longPause}${content}${texts.longPause}${texts.askContinue}`
        );
      }
      if (index < info.content.length - 1) {
        processedSpeach.push(
          `${content}${texts.longPause}${texts.askContinue}`
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
    return `${texts.titleThisWeek} ${title}`;
  } else if (i === 1) {
    return `${texts.titleLastWeek} ${title}`;
  } else {
    return `${texts.titleNWweeks.replace("{n}", i)} ${title}`;
  }
};

module.exports.loadAndRefreshFeedCache = () => {
  getFeed().then((feed) => cacheFeeds(feed));
  setInterval(() => getFeed().then((feeds) => cacheFeeds(feeds)), CACHE_TIME);
  setTimeout(() => console.log(speechCache), 10000);
};

module.exports.getSpeechNewsletterPart = (handlerInput) => {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  const bonilistaIndex = getSlotValue(
    handlerInput.requestEnvelope,
    "bonilistaIndex"
  );
  const bonilistaPart = getSlotValue(
    handlerInput.requestEnvelope,
    "bonilistaPart"
  );
  if (speechCache[bonilistaIndex].length > bonilistaPart) {
    sessionAttributes.bonilistaPart = bonilistaPart + 1;
  } else {
    sessionAttributes.bonilistaPart = null;
    sessionAttributes.bonilistaIndex = null;
  }
  if (bonilistaIndex > -1 && bonilistaPart > -1) {
    return speechCache[bonilistaIndex].content[bonilistaPart];
  } else {
    return texts.helpText;
  }
};

module.exports.getSpeechNewsletter = (index) => {
  if (index > 9) {
    return texts.helpText;
  } else if (speechCache[index]) {
    return speechCache[index].content[0];
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
