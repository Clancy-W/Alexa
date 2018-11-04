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


var jsonexample = {
    "document": {
        "type": "APL",
        "version": "1.0",
        "theme": "dark",
        "import": [
            {
                "name": "alexa-layouts",
                "version": "1.0.0"
            }
        ],
        "resources": [
            {
                "description": "Stock color for the light theme",
                "colors": {
                    "colorTextPrimary": "#151920"
                }
            },
            {
                "description": "Stock color for the dark theme",
                "when": "${viewport.theme == 'dark'}",
                "colors": {
                    "colorTextPrimary": "#f0f1ef"
                }
            },
            {
                "description": "Standard font sizes",
                "dimensions": {
                    "textSizeBody": 48,
                    "textSizePrimary": 27,
                    "textSizeSecondary": 23,
                    "textSizeDetails": 20,
                    "textSizeSecondaryHint": 25
                }
            },
            {
                "description": "Common spacing values",
                "dimensions": {
                    "spacingThin": 6,
                    "spacingSmall": 12,
                    "spacingMedium": 24,
                    "spacingLarge": 48,
                    "spacingExtraLarge": 72
                }
            },
            {
                "description": "Common margins and padding",
                "dimensions": {
                    "marginTop": 40,
                    "marginLeft": 60,
                    "marginRight": 60,
                    "marginBottom": 40
                }
            }
        ],
        "styles": {
            "textStyleBase": {
                "description": "Base font description; set color and core font family",
                "values": [
                    {
                        "color": "@colorTextPrimary"
                    }
                ]
            },
            "textStyleBase0": {
                "description": "Thin version of basic font",
                "extend": "textStyleBase",
                "values": {
                    "fontWeight": "100"
                }
            },
            "textStyleBase1": {
                "description": "Light version of basic font",
                "extend": "textStyleBase",
                "values": {
                    "fontWeight": "300"
                }
            },
            "textStyleBase2": {
                "description": "Regular version of basic font",
                "extend": "textStyleBase",
                "values": {
                    "fontWeight": "500"
                }
            },
            "mixinBody": {
                "values": {
                    "fontSize": "@textSizeBody"
                }
            },
            "mixinPrimary": {
                "values": {
                    "fontSize": "@textSizePrimary"
                }
            },
            "mixinDetails": {
                "values": {
                    "fontSize": "@textSizeDetails"
                }
            },
            "mixinSecondary": {
                "values": {
                    "fontSize": "@textSizeSecondary"
                }
            },
            "textStylePrimary": {
                "extend": [
                    "textStyleBase1",
                    "mixinPrimary"
                ]
            },
            "textStyleSecondary": {
                "extend": [
                    "textStyleBase0",
                    "mixinSecondary"
                ]
            },
            "textStyleBody": {
                "extend": [
                    "textStyleBase1",
                    "mixinBody"
                ]
            },
            "textStyleSecondaryHint": {
                "values": {
                    "fontFamily": "Bookerly",
                    "fontStyle": "italic",
                    "fontSize": "@textSizeSecondaryHint",
                    "color": "@colorTextPrimary"
                }
            },
            "textStyleDetails": {
                "extend": [
                    "textStyleBase2",
                    "mixinDetails"
                ]
            }
        },
        "layouts": {
            "FullHorizontalListItem": {
                "parameters": [
                    "listLength"
                ],
                "item": [
                    {
                        "type": "Container",
                        "height": "100vh",
                        "width": "100vw",
                        "alignItems": "center",
                        "justifyContent": "end",
                        "items": [
                            {
                                "type": "Image",
                                "position": "absolute",
                                "height": "100vh",
                                "width": "100vw",
                                "overlayColor": "rgba(0, 0, 0, 0.6)",
                                "source": "${data.image.sources[0].url}",
                                "scale": "best-fill",
                                "scrim": true
                            },
                            {
                                "type": "AlexaHeader",
                                "headerTitle": "${title}",
                                "headerAttributionImage": "${logo}",
                                "grow": 1
                            },
                            {
                                "type": "Text",
                                "text": "${data.textContent.primaryText.text}",
                                "style": "textStyleBody",
                                "maxLines": 1
                            },
                            {
                                "type": "Text",
                                "text": "${ordinal} | ${listLength}",
                                "paddingBottom": "20dp",
                                "color": "white",
                                "spacing": "5dp"
                            }
                        ]
                    }
                ]
            },
            "HorizontalListItem": {
                "item": [
                    {
                        "type": "Container",
                        "maxWidth": 528,
                        "minWidth": 312,
                        "paddingLeft": 16,
                        "paddingRight": 16,
                        "height": "100%",
                        "items": [
                            {
                                "type": "Image",
                                "source": "${data.image.sources[0].url}",
                                "height": "50vh",
                                "width": "50vh"
                            },
                            {
                                "type": "Text",
                                "text": "<b>${ordinal}.</b> ${data.textContent.primaryText.text}",
                                "style": "textStyleSecondary",
                                "maxLines": 1,
                                "spacing": 12
                            }
                        ]
                    }
                ]
            },
            "ListTemplate2": {
                "parameters": [
                    "backgroundImage",
                    "title",
                    "logo",
                    "hintText",
                    "listData"
                ],
                "items": [
                    {
                        "when": "${viewport.shape == 'round'}",
                        "type": "Container",
                        "height": "100%",
                        "width": "100%",
                        "items": [
                            {
                                "type": "Sequence",
                                "scrollDirection": "horizontal",
                                "data": "${listData}",
                                "height": "100%",
                                "width": "100%",
                                "numbered": true,
                                "item": [
                                    {
                                        "type": "FullHorizontalListItem",
                                        "listLength": "${payload.listTemplate2ListData.listPage.listItems.length}"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "source": "${backgroundImage}",
                                "scale": "best-fill",
                                "width": "100vw",
                                "height": "100vh",
                                "position": "absolute"
                            },
                            {
                                "type": "AlexaHeader",
                                "headerTitle": "${title}",
                                "headerAttributionImage": "${logo}"
                            },
                            {
                                "type": "Sequence",
                                "scrollDirection": "horizontal",
                                "paddingLeft": "@marginLeft",
                                "paddingRight": "@marginRight",
                                "data": "${listData}",
                                "height": "70vh",
                                "width": "100%",
                                "numbered": true,
                                "item": [
                                    {
                                        "type": "HorizontalListItem"
                                    }
                                ]
                            },
                            {
                                "type": "AlexaFooter",
                                "footerHint": "${payload.listTemplate2ListData.hintText}"
                            }
                        ]
                    }
                ]
            }
        },
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "item": [
                {
                    "type": "ListTemplate2",
                    "backgroundImage": "${payload.listTemplate2Metadata.backgroundImage.sources[0].url}",
                    "title": "${payload.listTemplate2Metadata.title}",
                    "hintText": "${payload.listTemplate2Metadata.hintText}",
                    "logo": "${payload.listTemplate2Metadata.logoUrl}",
                    "listData": "${payload.listTemplate2ListData.listPage.listItems}"
                }
            ]
        }
    },
    "dataSources": {
        "listTemplate2Metadata": {
            "type": "object",
            "objectId": "lt1Metadata",
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://c.pxhere.com/photos/7e/e2/star_milky_way_background_night_starry_sky_night_sky_space_texture-674008.jpg!d",
                        "size": "small",
                        "widthPixels": 0,
                        "heightPixels": 0
                    },
                    {
                        "url": "https://c.pxhere.com/photos/7e/e2/star_milky_way_background_night_starry_sky_night_sky_space_texture-674008.jpg!d",
                        "size": "large",
                        "widthPixels": 0,
                        "heightPixels": 0
                    }
                ]
            },
            "title": "Pet Feeder",
            "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
        },
        "listTemplate2ListData": {
            "type": "list",
            "listId": "lt2Sample",
            "totalNumberOfItems": 10,
            "hintText": "Try clicking on a pet!",
            "listPage": {
                "listItems": [
                    {
                        "listItemIdentifier": "brie",
                        "ordinalNumber": 1,
                        "textContent": {
                            "primaryText": {
                                "type": "PlainText",
                                "text": "Brie"
                            }
                        },
                        "image": {
                            "contentDescription": null,
                            "smallSourceUrl": null,
                            "largeSourceUrl": null,
                            "sources": [
                                {
                                    "url": "https://i.imgur.com/GcMKgWB.png",
                                    "size": "small",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                },
                                {
                                    "url": "https://i.imgur.com/GcMKgWB.png",
                                    "size": "large",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                }
                            ]
                        },
                        "token": "brie"
                    },
                    {
                        "listItemIdentifier": "brie",
                        "ordinalNumber": 2,
                        "textContent": {
                            "primaryText": {
                                "type": "PlainText",
                                "text": "Brie"
                            }
                        },
                        "image": {
                            "contentDescription": null,
                            "smallSourceUrl": null,
                            "largeSourceUrl": null,
                            "sources": [
                                {
                                    "url": "https://i.imgur.com/6oxYmhg.png",
                                    "size": "small",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                },
                                {
                                    "url": "https://i.imgur.com/6oxYmhg.png",
                                    "size": "large",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                }
                            ]
                        },
                        "token": "brie"
                    }
                ]
            }
        }
    }
}


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
  var setAda = docRef.set(temps, {
    merge: true
  });
}

function updatePet(u, n) {
  var docRef = db.collection('users').doc(u);
  var temps = {}
  temps[n + ".lastFed"] = FieldValue.serverTimestamp();
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
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'Inspire') {

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
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheDay') {
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
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheYesterday') {
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
          "ssml": "<speak>Yesterday's quote of the day is... " + obj.quotes[day - 1] + "</speak>"
        }
      }
    });
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'QuoteOfTheTomorrow') {
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
          "ssml": "<speak>Tomorrow's quote of the day is... " + obj.quotes[day + 1] + "</speak>"
        }
      }
    });
  } else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'AMAZON.HelpIntent') {
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
  } else {
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
  } else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'AMAZON.HelpIntent') {
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
  } else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GamePrice') {
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
                "ssml": "<speak>We found " + temp.name + ", which cost a total of $" + (info.data.price_overview.final / 100).toString() + ".</speak>"
              }
            }
          });
        } else {
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
  } else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GameDescription') {
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
                "ssml": "<speak>Here is a description of " + temp.name + ": " + info.data.short_description + ".</speak>"
              }
            }
          });
        } else {
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

  } else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === 'GameGenre') {
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
                "ssml": "<speak>Here is a genre " + temp.name + " fits into: " + info.data.genres[0].description + ".</speak>"
              }
            }
          });
        } else {
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
  } else {
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
		console.log(db.collection('users').doc(req.body.session.user.userId));
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to Pet Feeder, we help you remember to feed your pets, for information about what we can do, just say help.</speak>"
        },
        "directives": [{
            "type": "Alexa.Presentation.APL.RenderDocument",
            "document": jsonexample.document,
						"datasources": jsonexample.dataSources,
						"token": "123"
          }
        ]
      }
    });
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'AMAZON.HelpIntent') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To find out how to add a pet ask, how do I add a pet? To find out how to delete a pet ask, how do I delete a pet? To find out how to feed a pet, ask how do I feed a pet?</speak>"
        },
        "directives": [{
            "type": "Display.RenderTemplate",
            "document": {
              "type": "BodyTemplate6",
              "token": "ThisIsTheToken1",
              "backButton": "HIDDEN",
              "textContent": {
                "primaryText": {
                  "text": "Pet Feeder",
                  "type": "PlainText"
                },
                "secondaryText": {
                  "text": "",
                  "type": "PlainText"
                },
                "tertiaryText": {
                  "text": "",
                  "type": "PlainText"
                }
              }
            }
          },
          {
            "type": "Hint",
            "hint": {
              "type": "PlainText",
              "text": "How do I feed a pet?"
            }
          }
        ]
      }
    });
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'AddHelp') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To add a pet, just say, Alexa, add a pet, come on, try it yourself!</speak>"
        },
        "directives": [{
            "type": "Display.RenderTemplate",
            "template": {
              "type": "BodyTemplate6",
              "token": "ThisIsTheToken2",
              "backButton": "HIDDEN",
              "textContent": {
                "primaryText": {
                  "text": "Pet Feeder",
                  "type": "PlainText"
                },
                "secondaryText": {
                  "text": "",
                  "type": "PlainText"
                },
                "tertiaryText": {
                  "text": "",
                  "type": "PlainText"
                }
              }
            }
          },
          {
            "type": "Hint",
            "hint": {
              "type": "PlainText",
              "text": "Add a pet."
            }
          }
        ]
      }
    });
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'DeleteHelp') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To delete a pet, just say, Alexa, delete a pet, come on, try it yourself!</speak>"
        },
        "directives": [{
            "type": "Display.RenderTemplate",
            "template": {
              "type": "BodyTemplate6",
              "token": "ThisIsTheToken3",
              "backButton": "HIDDEN",
              "textContent": {
                "primaryText": {
                  "text": "Pet Feeder",
                  "type": "PlainText"
                },
                "secondaryText": {
                  "text": "",
                  "type": "PlainText"
                },
                "tertiaryText": {
                  "text": "",
                  "type": "PlainText"
                }
              }
            }
          },
          {
            "type": "Hint",
            "hint": {
              "type": "PlainText",
              "text": "Delete a pet."
            }
          }
        ]
      }
    });
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'FeedHelp') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>To feed a pet, just say, Alexa, has my pet been fed, come on, try it yourself!</speak>"
        },
        "directives": [{
            "type": "Display.RenderTemplate",
            "template": {
              "type": "BodyTemplate6",
              "token": "ThisIsTheToken4",
              "backButton": "HIDDEN",
              "textContent": {
                "primaryText": {
                  "text": "Pet Feeder",
                  "type": "PlainText"
                },
                "secondaryText": {
                  "text": "",
                  "type": "PlainText"
                },
                "tertiaryText": {
                  "text": "",
                  "type": "PlainText"
                }
              }
            }
          },
          {
            "type": "Hint",
            "hint": {
              "type": "PlainText",
              "text": "Has my pet been fed."
            }
          }
        ]
      }
    });
  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'AddPet') {
    if (!req.body.request.intent.slots.pet || !req.body.request.intent.slots.pet.value) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [{
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    } else if ((!req.body.request.intent.slots.name || !req.body.request.intent.slots.name.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [{
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    } else if (req.body.request.intent.confirmationStatus == "NONE") {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [{
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    } else if (req.body.request.intent.confirmationStatus == "DENIED") {
      res.json({
        "version": "1.0",
        "response": {
          "shouldEndSession": false,
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak>We cancelled it, try asking again!</speak>"
          },
          "directives": [{
              "type": "Display.RenderTemplate",
              "template": {
                "type": "BodyTemplate1",
                "token": "ThisIsTheToken8",
                "backButton": "HIDDEN",
                "title": "Pet Feeder",
                "textContent": {
                  "primaryText": {
                    "text": "Try Again.",
                    "type": "PlainText"
                  },
                  "secondaryText": {
                    "text": "",
                    "type": "PlainText"
                  },
                  "tertiaryText": {
                    "text": "",
                    "type": "PlainText"
                  }
                }
              }
            },
            {
              "type": "Hint",
              "hint": {
                "type": "PlainText",
                "text": "Add a pet."
              }
            }
          ]
        }
      });
    } else {
      res.json({
        "version": "1.0",
        "response": {
          "shouldEndSession": true,
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak>We added your pet " + req.body.request.intent.slots.pet.value + " called " + req.body.request.intent.slots.name.value + ".</speak>"
          }
        }
      });
      addPet(req.body.session.user.userId, req.body.request.intent.slots.name.value, req.body.request.intent.slots.pet.value);

    }

  } else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'DeletePet') {
    if ((!req.body.request.intent.slots.name || !req.body.request.intent.slots.name.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [{
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    } else {
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

  } else if (req.body.request.type === "IntentRequest" && req.body.request.intent.name === "FeedPet") {
    if ((!req.body.request.intent.slots.name || !req.body.request.intent.slots.name.value)) {
      res.json({
        "version": "1.0",
        "response": {
          "directives": [{
              "type": "Dialog.Delegate",
              "updatedIntent": req.body.request.intent
            }
          ]
        }
      });
    } else {
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
                  "ssml": "<speak>We couldn't find a pet with that name, try asking again!</speak>"
                },
                "directives": [{
                    "type": "Display.RenderTemplate",
                    "template": {
                      "type": "BodyTemplate1",
                      "token": "ThisIsTheToken9",
                      "backButton": "HIDDEN",
                      "title": "Pet Feeder",
                      "textContent": {
                        "primaryText": {
                          "text": "Try Again.",
                          "type": "PlainText"
                        },
                        "secondaryText": {
                          "text": "",
                          "type": "PlainText"
                        },
                        "tertiaryText": {
                          "text": "",
                          "type": "PlainText"
                        }
                      }
                    }
                  },
                  {
                    "type": "Hint",
                    "hint": {
                      "type": "PlainText",
                      "text": "Feed my pet."
                    }
                  }
                ]
              }
            });
          } else {
            if (doc.data().hasOwnProperty(req.body.request.intent.slots.name.value)) {

              lastFeed = new Date(doc.data()[req.body.request.intent.slots.name.value].lastFed + 'Z');
              now = new Date();
              var time = (now - lastFeed) / 3600000;
              if (req.body.request.intent.confirmationStatus == "NONE") {
                if (time > 6) {
                  res.json({
                    "version": "1.0",
                    "response": {
                      "directives": [{
                          "type": "Dialog.Delegate",
                          "updatedIntent": req.body.request.intent
                        }
                      ]
                    }
                  });
                } else {
                  res.json({
                    "version": "1.0",
                    "response": {
                      "shouldEndSession": true,
                      "outputSpeech": {
                        "type": "SSML",
                        "ssml": "<speak>" + req.body.request.intent.slots.name.value + " has already been fed.</speak>"
                      }
                    }
                  });
                }
              } else {
                if (req.body.request.intent.confirmationStatus == "CONFIRMED") {
                  updatePet(req.body.session.user.userId, req.body.request.intent.slots.name.value);
                  res.json({
                    "version": "1.0",
                    "response": {
                      "shouldEndSession": true,
                      "outputSpeech": {
                        "type": "SSML",
                        "ssml": "<speak>Ok, We fed  " + req.body.request.intent.slots.name.value + "!</speak>"
                      }
                    }
                  });
                } else {
                  res.json({
                    "version": "1.0",
                    "response": {
                      "shouldEndSession": true,
                      "outputSpeech": {
                        "type": "SSML",
                        "ssml": "<speak>Ok, We did not feed  " + req.body.request.intent.slots.name.value + ".</speak>"
                      }
                    }
                  });
                }
              }
            } else {
              res.json({
                "version": "1.0",
                "response": {
                  "shouldEndSession": false,
                  "outputSpeech": {
                    "type": "SSML",
                    "ssml": "<speak>We couldn't find a pet with that name, try again.</speak>"
                  },
                  "directives": [{
                      "type": "Display.RenderTemplate",
                      "template": {
                        "type": "BodyTemplate1",
                        "token": "ThisIsTheToken11",
                        "backButton": "HIDDEN",
                        "title": "Pet Feeder",
                        "textContent": {
                          "primaryText": {
                            "text": "Try Again.",
                            "type": "PlainText"
                          },
                          "secondaryText": {
                            "text": "",
                            "type": "PlainText"
                          },
                          "tertiaryText": {
                            "text": "",
                            "type": "PlainText"
                          }
                        }
                      }
                    },
                    {
                      "type": "Hint",
                      "hint": {
                        "type": "PlainText",
                        "text": "Feed my pet."
                      }
                    }
                  ]
                }
              });
            }
          }
        })
    }

  }
})
app.listen(app.get("port"));
