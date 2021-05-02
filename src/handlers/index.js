const texts = require("../../resources/texts");
const speech = require("../speech");

module.exports.LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(texts.welcomeText)
      .reprompt(texts.welcomeText)
      .withSimpleCard(texts.title, texts.welcomeText)
      .getResponse();
  },
};

module.exports.ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(texts.errorText)
      .reprompt(texts.errorText)
      .getResponse();
  },
};

const saveSessionInfo = (handlerInput, bonilistaIndex, bonilistaPart = 0) => {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.bonilistaPart = bonilistaPart;
  sessionAttributes.bonilistaIndex = bonilistaIndex;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
};

const retrieveSessionInfo = (handlerInput) => {
  return handlerInput.attributesManager.getSessionAttributes();
};

const getBonilistaNewsletter = (handlerInput) => {
  const bonilistaIndex = 0;
  saveSessionInfo(handlerInput, bonilistaIndex);
  return handlerInput.responseBuilder
    .speak(speech.getSpeechNewsletter(bonilistaIndex))
    .reprompt(texts.sectionReprompt)
    .withSimpleCard(texts.title, texts.helpTextCard)
    .getResponse();
};

const getBonilistaNewsletterOneWeekAgo = (handlerInput) => {
  const bonilistaIndex = 1;
  saveSessionInfo(handlerInput, bonilistaIndex);
  return handlerInput.responseBuilder
    .speak(speech.getSpeechNewsletter(bonilistaIndex))
    .reprompt(texts.sectionReprompt)
    .withSimpleCard(texts.title, texts.helpTextCard)
    .getResponse();
};

const getBonilistaWeeksAgoNewsletter = (handlerInput) => {
  const weeksAgo =
    handlerInput.requestEnvelope.request.intent.slots &&
    handlerInput.requestEnvelope.request.intent.slots.WeeksAgo &&
    handlerInput.requestEnvelope.request.intent.slots.WeeksAgo.value || 1;

  if (weeksAgo) {
    saveSessionInfo(handlerInput, weeksAgo);
    return handlerInput.responseBuilder
      .speak(speech.getSpeechNewsletter(weeksAgo))
      .reprompt(texts.sectionReprompt)
      .withSimpleCard(texts.title, texts.helpTextCard)
      .getResponse();
  } else {
    getHelpResponse(handlerInput);
  }
};

const getNextPartResponse = (handlerInput) => {
  const { bonilistaIndex, bonilistaPart } = retrieveSessionInfo(handlerInput);
  const currentPart = bonilistaPart + 1;
  const currentSpeech = speech.getSpeechNewsletterPart(
    bonilistaIndex,
    currentPart
  );

  if (currentSpeech) {
    saveSessionInfo(handlerInput, bonilistaIndex, currentPart);
    return handlerInput.responseBuilder
      .speak(currentSpeech)
      .reprompt(texts.sectionReprompt)
      .withSimpleCard(texts.title, texts.helpTextCard)
      .getResponse();
  } else {
    saveSessionInfo(handlerInput, null, null);
    return getHelpResponse(handlerInput);
  }
};

const getBonilistaTitles = (handlerInput) =>
handlerInput.responseBuilder
  .speak(speech.getSpeechNewsletterTitles())
  .reprompt(texts.sectionReprompt)
  .withSimpleCard(texts.title, texts.helpTextCard)
  .getResponse();

const getStopResponse = (handlerInput) =>
  handlerInput.responseBuilder
    .speak(texts.byeText)
    .withShouldEndSession(true)
    .getResponse();

const getHelpResponse = (handlerInput) =>
  handlerInput.responseBuilder
    .speak(texts.sectionReprompt)
    .reprompt(texts.sectionReprompt)
    .withSimpleCard(texts.title, texts.helpTextCard)
    .getResponse();

module.exports.IntentRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest";
  },
  handle(handlerInput) {
    switch (handlerInput.requestEnvelope.request.intent.name) {
      case "GetBonilistaWeeksAgo":
        return getBonilistaWeeksAgoNewsletter(handlerInput);
      case "GetLastBonilista":
        return getBonilistaNewsletter(handlerInput);
      case "GetPrevBonilista":
        return getBonilistaNewsletterOneWeekAgo(handlerInput);
      case "AMAZON.NoIntent":
        return getHelpResponse(handlerInput);
      case "AMAZON.YesIntent":
        return getNextPartResponse(handlerInput);
      case "GetBonilistaTitles":
        return getBonilistaTitles(handlerInput);
      case "AMAZON.CancelIntent":
      case "AMAZON.StopIntent":
        return getStopResponse(handlerInput);
      default:
        return getHelpResponse(handlerInput);
    }
  },
};
module.exports.SessionEndRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    return getStopResponse(handlerInput);
  },
};
