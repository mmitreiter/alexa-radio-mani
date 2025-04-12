
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const STREAM_URL = "http://radio.mitreiter.de:8000/radio.mp3";

// Handle Alexa POST requests
app.post("/alexa", (req, res) => {
  const requestType = req.body.request.type;

  if (
    requestType === "LaunchRequest" ||
    (requestType === "IntentRequest" && req.body.request.intent.name === "PlayStreamIntent")
  ) {
    const response = {
      version: "1.0",
      response: {
        directives: [
          {
            type: "AudioPlayer.Play",
            playBehavior: "REPLACE_ALL",
            audioItem: {
              stream: {
                token: "1",
                url: STREAM_URL,
                offsetInMilliseconds: 0
              }
            }
          }
        ],
        shouldEndSession: true
      }
    };
    return res.json(response);
  }

  // Catch-all fallback
  res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "Dieser Skill unterstützt nur das Abspielen des Radios."
      },
      shouldEndSession: true
    }
  });
});

app.get("/", (req, res) => {
  res.send("mani.artificial Alexa Endpoint is live.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
