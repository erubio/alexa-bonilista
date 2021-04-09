const texts = require("../../resources/texts");
const { getFeed } = require("../feed");

let speechCache = [];
const CACHE_TIME = 12 *60 * 60 * 1000; //12 hour

const generateFeedSpeach = (info) => {
  return `${info.title}${texts.longPause}${info.content}${texts.longPause}${texts.endBonilista}`;
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

module.exports.loadAndRefreshFeedCache = () => {
  getFeed().then((feed) => cacheFeeds(feed));
  setInterval(() => getFeed().then((feeds) => cacheFeeds(feeds)), CACHE_TIME);
};

module.exports.getSpeechNewsletter = (index) => {
  if (index > 10) {
    return texts.helpText;
  } else if (speechCache[index]){
    return speechCache[index].content;
  }
};

module.exports.getSpeechNewsletterTitles = () => {
  const titles = speechCache.map(entry => entry.title);
  return `${text.titles}${texts.pause}${titles.join(texts.longPause)}`;
}
