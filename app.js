let express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  stringSimilarity = require('string-similarity'),
  app = express(),
  admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.id))
});
var FieldValue = require('firebase-admin').firestore.FieldValue;
var db = admin.firestore();




let alexaVerifier = require('alexa-verifier'); // at the top of our file
var obj = require("./inspiration.json")


console.log(process.env.id);

function addPet(u, n, t) {
  var docRef = db.collection('users').doc(u);
  var temps = {}
  temps[n] = {
    name: n,
    type: t,
    lastFed: FieldValue.serverTimestamp()
  };
  var setAda = docRef.set(temps, {merge: true});
}

function updatePet(u, n) {
  var docRef = db.collection('users').doc(u);
  var temps = {}
  temps[n+".lastFed"] = FieldValue.serverTimestamp();
  var setAda = docRef.update(temps);
}

function deletePet(u, n) {
  var docRef = db.collection('users').doc(u);
  var temps = {}
  temps[n] = FieldValue.delete();
  var removeCapital = docRef.update(temps);
}

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
          "ssml": "<speak>To get the price of a game, for example Cuphead, just say: \"What is the price of Cuphead?\" To get a description, just say: \"Describe Cuphead\", come on, try it out for yourself!</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GamePrice') {
    if (!(!req.body.request.intent.slots.game || !req.body.request.intent.slots.game.value)) {
      var temp = json[games.indexOf(stringSimilarity.findBestMatch(req.body.request.intent.slots.game.value, games).bestMatch.target)];
      var ops = {
        url: 'https://store.steampowered.com/api/appdetails?appids=' + temp.appid + '&cc=us&l=en',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      };
      request(ops, function(err, resp, body) {
        var info = JSON.parse(body)[temp.appid];
        if (info.data.price_overview) {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": true,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>We found " + temp.name +", which cost a total of $" + (info.data.price_overview.final/100).toString() + ".</speak>"
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
                "ssml": "<speak>We could not find a price for " + temp.name + ".</speak>"
              }
            }
          });
        }
      });
    }
  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GameDescription') {
    if (!(!req.body.request.intent.slots.game || !req.body.request.intent.slots.game.value)) {
      var temp = json[games.indexOf(stringSimilarity.findBestMatch(req.body.request.intent.slots.game.value, games).bestMatch.target)];
      var ops = {
        url: 'https://store.steampowered.com/api/appdetails?appids=' + temp.appid + '&cc=us&l=en',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      };

      request(ops, function(err, resp, body) {
        var info = JSON.parse(body)[temp.appid];
        if (info.data.short_description) {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": true,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>Here is a description of " + temp.name +": " + info.data.short_description + ".</speak>"
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
                "ssml": "<speak>We could not find a description for " + temp.name + ".</speak>"
              }
            }
          });
        }
      });
    }

  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GameGenre') {
    if (!(!req.body.request.intent.slots.game || !req.body.request.intent.slots.game.value)) {
      var temp = json[games.indexOf(stringSimilarity.findBestMatch(req.body.request.intent.slots.game.value, games).bestMatch.target)];
      var ops = {
        url: 'https://store.steampowered.com/api/appdetails?appids=' + temp.appid + '&cc=us&l=en',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        }
      };

      request(ops, function(err, resp, body) {
        var info = JSON.parse(body)[temp.appid];
        if (info.data.genres) {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": true,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>Here is a genre " + temp.name +" fits into: " + info.data.genres[0].description + ".</speak>"
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
                "ssml": "<speak>We could not find a description for " + temp.name + ".</speak>"
              }
            }
          });
        }
      });
    }
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
app.post("/pet", requestVerifier, function(req, res) {
  if (req.body.request.type === 'LaunchRequest') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to Pet Feeder, we help you remember to feed your pets, for information about what we can do, just say help.</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'AMAZON.HelpIntent') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To find out how to add a pet ask, how do I add a pet? To find out how to delete a pet ask, how do I delete a pet? To find out how to feed a pet, ask how do I feed a pet?</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'AddHelp') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To add a pet, just tell Alexa to add a pet, come on, try it yourself!</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'DeleteHelp') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To delete a pet, just tell Alexa to delete a pet, come on, try it yourself!</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'FeedHelp') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To feed a pet, just tell Alexa to feed your pet, come on, try it yourself!</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'AddPet'){
    if ((!req.body.request.intent.slots.pet || !req.body.request.intent.slots.pet.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [
            {
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    }
    else if ((!req.body.request.intent.slots.name || !req.body.request.intent.slots.name.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [
            {
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    }
    else if (req.body.request.intent.confirmationStatus == "NONE") {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [
            {
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    }
    else if (req.body.request.intent.confirmationStatus == "DENIED") {
      res.json({
        "version": "1.0",
        "response": {
          "shouldEndSession": false,
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak>We cancelled it, try asking again!</speak>"
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
            "ssml": "<speak>We added your pet " + req.body.request.intent.slots.pet.value +" called " + req.body.request.intent.slots.name.value + ".</speak>"
          }
        }
      });
      addPet(req.body.session.user.userId, req.body.request.intent.slots.name.value, req.body.request.intent.slots.pet.value);

    }

  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'DeletePet'){
    if ((!req.body.request.intent.slots.name || !req.body.request.intent.slots.name.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [
            {
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
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
            "ssml": "<speak>We deleted your pet called " + req.body.request.intent.slots.name.value + ".</speak>"
          }
        }
      });
      deletePet(req.body.session.user.userId, req.body.request.intent.slots.name.value);

    }

  }
  else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === "FeedPet") {
    if ((!req.body.request.intent.slots.name || !req.body.request.intent.slots.name.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [
            {
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    }
    else {
      var cityRef = db.collection('users').doc(req.body.session.user.userId);
      var getDoc = cityRef.get()
      .then(doc => {
        if (!doc.exists) {
          res.json({
            "version": "1.0",
            "response": {
              "shouldEndSession": false,
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>We couldn't find a pet with that name, try again.</speak>"
              }
            }
          });
        } else {
          if (doc.data().hasOwnProperty(req.body.request.intent.slots.name.value)) {
            updatePet(req.body.session.user.userId, req.body.request.intent.slots.name.value);
            console.log(doc.data());
            res.json({
              "version": "1.0",
              "response": {
                "shouldEndSession": true,
                "outputSpeech": {
                  "type": "SSML",
                  "ssml": "<speak>We fed your pet!</speak>"
                }
              }
            });
          }
          else {
            res.json({
              "version": "1.0",
              "response": {
                "shouldEndSession": false,
                "outputSpeech": {
                  "type": "SSML",
                  "ssml": "<speak>We couldn't find a pet with that name, try again.</speak>"
                }
              }
            });
          }
        }
      })
    }

  }
})
app.listen(app.get("port"));
