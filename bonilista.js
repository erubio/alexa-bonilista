const express = require("express");
const { ExpressAdapter } = require("ask-sdk-express-adapter");
const Alexa = require("ask-sdk-core");
const app = express();
const skillBuilder = Alexa.SkillBuilders.custom();
const handlers = require("./src/handlers");
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, true, true);
const PORT = process.env.BONI_PORT || 8081;

const speech = require('./src/speech');

skillBuilder
  .addRequestHandlers(
    handlers.LaunchRequestHandler,
    handlers.IntentRequestHandler,
    handlers.SessionEndRequestHandler
  )
  .addErrorHandlers(handlers.ErrorHandler);

speech.loadFeedCache();

app.post("/", adapter.getRequestHandlers());
app.get("/refreshcache", (req,res) => {
  if(/localhost/i.test(req.headers.host)) {//only from local connection 
    speech.loadFeedCache();
    return res.status(201).send();
  }
  return res.status(403).send();
});

app.get(/.*/, (req,res) => res.status(404).send());
app.post(/.*/, (req,res) => res.status(404).send());
app.put(/.*/, (req,res) => res.status(404).send());
app.delete(/.*/, (req,res) => res.status(404).send());

app.listen(PORT);
