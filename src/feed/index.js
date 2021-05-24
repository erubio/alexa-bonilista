const fetch = require("node-fetch");
const xml2js = require("xml2js");
const { JSDOM } = require("jsdom");
const { FEED_URL } = require("../utils/constants");
const texts = require("../../resources/texts");
const parser = new xml2js.Parser({ attrkey: "type" });
const alexaLimit = 6000;
const endMargin = 50;

const splitContent = (content) => {
  const splittedContent = [];
  let splitIndex = 0;
  let lastSplitIndex = 0;
  do {
    splitIndex =
      content
        .substring(lastSplitIndex, alexaLimit + lastSplitIndex)
        .lastIndexOf(texts.pause) + lastSplitIndex;
    splittedContent.push(content.substring(lastSplitIndex, splitIndex));
    lastSplitIndex = splitIndex;
  } while (content.length - splitIndex > endMargin);
  return splittedContent;
};

const manageContentLimits = (content) => {
  if (content.length < alexaLimit) {
    return [content];
  } else {
    return splitContent(content);
  }
};

const removeHeadContent = (content) => {
  return content.replace(/<head>(?:.|\n|\r|\s|\S)+?<\/head>/i, "");
};

const removeEmojis = (content) => {
  const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
  return content.replace(emojiRegex, "");
};

const getArticleContent = (content) => {
  const durationRegex = /^.*min\.\saprox\.<break time="[0-9]\.*[0-9]*s" \/>/i;
  const ilustrationRegex = /© Ilustraci.*Bilbao/i;
  const endRegex = /Tu\s+MARCA\s+aquí.(?:.|\n|\r|\s|\S)+/i;
  return JSDOM.fragment(removeEmojis(removeHeadContent(content))).textContent
    .replace(/\n+\s+/gi, texts.pause)
    .replace(durationRegex, "")
    .replace(ilustrationRegex, "")
    .replace("#Bonilista", "Bonilista")
    .replace(/&/g, "and")
    .replace(endRegex, "");
};

const processContent = (entryContent) => {
  return manageContentLimits(getArticleContent(entryContent[0]));
};

const processFeed = (data) => {
  const entries = data.rss.channel[0].item;
  return entries.map((entry) => {
    return {
      content: processContent(entry["content:encoded"]),
      releaseDate: entry.pubDate,
      title: removeEmojis(entry.title[0]).replace("#Bonilista", "Bonilista"),
    };
  });
};

const getFeedData = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.text())
      .then((body) => {
        parser.parseString(body, function (error, result) {
          if (error) {
            reject(error);
          } else {
            resolve(processFeed(result));
          }
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.getFeed = () => {
  return new Promise((resolve, reject) => {
    getFeedData(FEED_URL)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => reject(err));
  });
};
