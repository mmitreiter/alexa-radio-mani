const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const STREAM_URL = "http://radio.mitreiter.de:8000/radio.mp3";

app.post("/alexa", (req, res) => {
  const reqType = req.body.request.type;

  if (
    reqType === "LaunchRequest" ||
    (reqType === "IntentRequest" && req.body.request.intent.name === "PlayStreamIntent")
  ) {
    const response = {
      version: "1.0",
      sessionAttributes: {},
      response: {
        shouldEndSession: true,
        directives: [
          {
            type: "AudioPlayer.Play",
            playBehavior: "REPLACE_ALL",
            audioItem: {
              stream: {
                token: "mani-radio",
                url: STREAM_URL,
                offsetInMilliseconds: 0
              }
            }
          }
        ]
      }
    };
    res.status(200).json(response);
  } else {
    res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Dieser Skill spielt dein KI-Radio ab."
        },
        shouldEndSession: true
      }
    });
  }
});

app.get("/", (req, res) => {
  res.send("mani.artificial Alexa stream endpoint is live.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port", port);
});
