const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();
const { getFeed } = require("../feed");
const texts = require("../../resources/texts");
const speechCache = {
  articles: [],
  titles: "",
  welcomeMessage: "",
  helpText: "",
  helpTextCard: "",
  helpMaxWeeksAgo: "",
  sectionReprompt: ""
};

const addEngLangTags = (content) => {
  const quotes = content.match(/(«)([^»]*)(»)/gi);
  let processedContent = content;
  if (quotes && quotes.length > 0) {
    quotes.forEach((quote) => {
      const detect = lngDetector.detect(quote);
      const langDetected = detect && detect[0] && detect[0][0];
      const langPercent = detect && detect[0] && detect[0][1];
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

const setWeeksToText = (text) => {
  return text.replace("{nWeeks}", speechCache.articles.length);
};


const generateAndSaveSpeeches = (feed) => {
  speechCache.articles = processArticles(feed);
  speechCache.titles = `${texts.titles}${texts.pause}${processTitles(feed).join(
    texts.pause
  )}${texts.titlesEnd}`;
  speechCache.welcomeMessage = setWeeksToText(texts.welcomeText)
  speechCache.helpText = setWeeksToText(texts.helpText);
  speechCache.helpTextCard = setWeeksToText(texts.helpTextCard);
  speechCache.helpMaxWeeksAgo = setWeeksToText(texts.helpMaxWeeksAgo);
  speechCache.sectionReprompt = setWeeksToText(texts.sectionReprompt);
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
  getFeed().then((feed) => generateAndSaveSpeeches(feed));
};

module.exports.getSpeechCache = () => {
  return speechCache;
};
