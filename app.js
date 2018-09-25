let express = require('express'),
  bodyParser = require('body-parser'),
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

function buildResponse(session, speech, card, end) {
  return {
    version: "1.0",
    sessionAttributes: session,
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: speech
      },
      card: card,
      shouldEndSession: !!end
    }
  };
}

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
          "ssml": "<speak>Welcome to quotable, your tool for good quotes</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'Inspire'){

    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
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
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>The quote of the day is... " + obj.quotes[day] + "</speak>"
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
          "ssml": "<speak>Goodbye</speak>"
        }
      }
    });
  }
}); app.listen(app.get("port"));
