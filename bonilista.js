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

//app.use(express.static("public"));

skillBuilder
  .addRequestHandlers(
    handlers.LaunchRequestHandler,
    handlers.IntentRequestHandler,
    handlers.SessionEndRequestHandler
  )
  .addErrorHandlers(handlers.ErrorHandler);

speech.loadAndRefreshFeedCache();

app.post("/bonilista", adapter.getRequestHandlers());
app.get("/bonilista", speech.getSpeechNewsletter);

app.listen(PORT);
