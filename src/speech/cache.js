const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();
const { getFeed } = require("../feed");
const texts = require("../../resources/texts");
let speechCache = { articles: [], titles: "" };

const addEngLangTags = (content) => {
  const quotes = content.match(/(«)([^»]*)(»)/gi);
  let processedContent = content;
  if (quotes && quotes.length > 0) {
    quotes.forEach((quote) => {
      const langDetected = lngDetector.detect(quote)[0][0];
      const langPercent = lngDetector.detect(quote)[0][1];
      if (
        (langDetected === "english" || langDetected === "dutch") &&
        langPercent > 0.21
      ) {
        processedContent = content.replace(
          quote,
          `<lang xml:lang="en-US">${quote}</lang>`
        );
      }
    });
  }
  return processedContent;
};

const generateArticleSpeach = (info) => {
  const processedSpeach = [];
  info.content.forEach((content, index) => {
    const title = addEngLangTags(info.title);
    if (info.content.length > 1) {
      const randomContinue = parseInt(Math.random() * 5);
      const processedContent = addEngLangTags(content);
      if (index === 0) {
        processedSpeach.push(
          `${title}${texts.longPause}${processedContent}${texts.longPause}${
            texts["askContinue" + randomContinue]
          }`
        );
      } else if (index < info.content.length - 1) {
        processedSpeach.push(
          `${processedContent}${texts.longPause}${
            texts["askContinue" + randomContinue]
          }`
        );
      } else {
        processedSpeach.push(
          `${processedContent}${texts.longPause}${texts.endBonilista}`
        );
      }
    } else {
      processedSpeach.push(
        `${title}${texts.longPause}${addEngLangTags(info.content[0])}${
          texts.longPause
        }${texts.endBonilista}`
      );
    }
  });
  return processedSpeach;
};

const processArticles = (feed) => {
  return feed.map((f) => {
    return {
      content: generateArticleSpeach(f),
      releaseDate: new Date(f.releaseDate).getTime(),
    };
  });
};

const processTitles = (feed) => {
  return feed.map((f, i) => getTextTitleByWeek(addEngLangTags(f.title), i));
};

const cacheFeed = (feed) => {
  speechCache.articles = processArticles(feed);
  speechCache.titles = `${texts.titles}${texts.pause}${processTitles(feed).join(
    texts.pause
  )}${texts.titlesEnd}`;
};

const getTextTitleByWeek = (title, i) => {
  if (i === 0) {
    return `${texts.titleThisWeek} ${title}.`;
  } else if (i === 1) {
    return `${texts.titleLastWeek} ${title}.`;
  } else {
    return `${texts.titleNWweeks.replace("{n}", i)} ${title}.`;
  }
};

module.exports.loadFeed = () => {
  getFeed().then((feed) => cacheFeed(feed));
};

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
