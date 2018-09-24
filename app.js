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
  console.log("Request GOT")
  res.json(
    buildResponse({
        dateRequested: true
      },
      '<speak>I can tell you the weather<break time="1s"/> but you must give me a day!</speak>', {},
      false
    )
  )
}); app.listen(app.get("port"));
