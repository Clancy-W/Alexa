let express = require('express'),
  bodyParser = require('body-parser'),
  app = express();

let alexaVerifier = require('alexa-verifier'); // at the top of our file

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
app.post('/flip', requestVerifier, function(req, res) {
  console.log(Math.random());
  var a = "tails";
  res.json({
    "version": "1.0",
    "response": {
      "shouldEndSession": true,
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak>You flipped a <break time=\"1s\"/> "+ a +"</speak>"
      }
    }
  });
}); app.listen(app.get("port"));
