let express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  stringSimilarity = require('string-similarity'),
  app = express();

let alexaVerifier = require('alexa-verifier'); // at the top of our file
var obj = require("./inspiration.json")

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}

const options = {
  url: 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=STEAMKEY&format=json',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8'
  }
};

var json = [];
var games = [];

request(options, function(err, res, body) {
  json = JSON.parse(body).applist.apps;
  for (var i = 0; i < json.length; i++) {
    games.push(json[i].name);
  }

});

app.set('port', process.env.PORT || 3000);


app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));
app.post('/quote', requestVerifier, function(req, res) {
  var a = "tails";
  if (req.body.request.type === 'LaunchRequest') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to Daily Quote, your tool for good quotes that will inspire you, for information about what it can do, just say help.</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'Inspire'){

    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>" + obj.quotes[Math.floor(Math.random() * obj.quotes.length + 1)] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheDay'){
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>The quote of the day is... " + obj.quotes[day] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheYesterday'){
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Yesterday's quote of the day is... " + obj.quotes[day-1] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheTomorrow'){
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Tomorrow's quote of the day is... " + obj.quotes[day+1] + "</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'AMAZON.HelpIntent') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To get the quote of the day, just say: \"What is the quote of the day?\", you can also do this for yesterday and tomorrow!... To get a random quote, just say: \"Inspire me\", come on, try it out for yourself!</speak>"
        }
      }
    });
  }
  else {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Goodbye, we hope to see you soon!</speak>"
        }
      }
    });
  }
});

app.post('/steam', requestVerifier, function(req, res) {
  if (req.body.request.type === 'LaunchRequest') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to Steam Assistant,for information about what we can do, just say help.</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'AMAZON.HelpIntent') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To get the quote of the day, just say: \"What is the quote of the day?\", you can also do this for yesterday and tomorrow!... To get a random quote, just say: \"Inspire me\", come on, try it out for yourself!</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'AMAZON.HelpIntent') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To get the quote of the day, just say: \"What is the quote of the day?\", you can also do this for yesterday and tomorrow!... To get a random quote, just say: \"Inspire me\", come on, try it out for yourself!</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GamePrice') {
    if (!(!req.body.request.intent.slots.game || !req.body.request.intent.slots.game.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "shouldEndSession": false,
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak>We found" + stringSimilarity.findBestMatch(req.body.request.intent.slots.game.value, games).bestMatch.target +".</speak>"
          }
        }
      });
    }

  }
});
app.listen(app.get("port"));
