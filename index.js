const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const STREAM_URL = "https://radio.mitreiter.de/listen/mani.artificial/radio.mp3";

app.post("/alexa", (req, res) => {
  console.log("Alexa request received");

  const requestType = req.body && req.body.request && req.body.request.type;
  const intentName = req.body &&
    req.body.request &&
    req.body.request.intent &&
    req.body.request.intent.name;

  console.log("Request type:", requestType);
  console.log("Intent:", intentName);

if (
  requestType === "LaunchRequest" ||
  (requestType === "IntentRequest" && intentName === "PlayStreamIntent")
) {
  const nowPlaying = await getNowPlaying();

  const response = {
    version: "1.0",
    sessionAttributes: {},
    response: {
      shouldEndSession: true,
      directives: [
        {
          type: "Alexa.Presentation.APL.RenderDocument",
          token: "now-playing-view",
          document: require("./apl-template.json"), // alternativ direkt im Code
          datasources: {
            audioPlayerTemplateData: {
              type: "object",
              properties: {
                audioControlType: "none",
                audioSources: [nowPlaying.streamUrl],
                coverImageSource: nowPlaying.cover,
                headerTitle: nowPlaying.artist,
                logoUrl: nowPlaying.cover,
                primaryText: nowPlaying.title,
                secondaryText: nowPlaying.description,
                sliderType: "determinate"
              }
            }
          }
        },
        {
          type: "AudioPlayer.Play",
          playBehavior: "REPLACE_ALL",
          audioItem: {
            stream: {
              token: "mani-radio",
              url: nowPlaying.streamUrl,
              offsetInMilliseconds: 0
            }
          }
        }
      ]
    }
  };

  console.log("Sende dynamisches APL + Stream");
  return res.status(200).json(response);
}


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
});

app.get("/", (req, res) => {
  res.send("mani.artificial Alexa endpoint is live.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port", port);
});
