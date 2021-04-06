const fetch = require("node-fetch");
const xml2js = require("xml2js");
//const texts = require("../../resources/texts");
const { JSDOM } = require("jsdom");
const { FEED_URL } = require("../utils/constants");
const parser = new xml2js.Parser({ attrkey: "type" });

const processContent = (entryContent) => {
  const withoutHead = entryContent[0].replace(
    /<head>(?:.|\n|\r|\s|\S)+?<\/head>/i,
    ""
  );
  return JSDOM.fragment(withoutHead)
    .textContent.replace(/\n+\s+/gi, '<break time="1.5s" />')
    .replace(/^.*min\.\saprox\.<break time="1.5s" \/>/, "")
    .replace(/Tu\s+MARCA\s+aquí.(?:.|\n|\r|\s|\S)+/i, '');
};

const processFeed = (data) => {
  const entries = data.rss.channel[0].item;
  return entries.map((entry) => {
    return {
      content: processContent(entry["content:encoded"]),
      releaseDate: entry.pubDate,
      title: entry.title,
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
