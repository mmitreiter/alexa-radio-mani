const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const STREAM_URL = "https://radio.mitreiter.de/listen/mani.artificial/radio.mp3";

const fetch = require("node-fetch");

async function getNowPlaying() {
  try {
    const res = await fetch("https://radio.mitreiter.de/api/nowplaying");
    const data = await res.json();

    console.log("API-Daten empfangen:", JSON.stringify(data, null, 2)); // Debug

    const title = data?.now_playing?.song?.title || "mani.artificial";
    const artist = "Digitales Radio Manfred";
    const cover = data?.now_playing?.song?.art || "https://mitreiter.de/wp-content/uploads/2025/04/mani-artificial-logo-1920x1080-_2.png";
    const description = data?.now_playing?.song?.title
      ? `Gerade läuft: ${artist} – ${title}`
      : "Dein KI-Radio mit brandneuer Musik.";

    return {
      streamUrl: STREAM_URL,
      title,
      artist,
      description,
      cover
    };

  } catch (err) {
    console.error("Fehler beim Abrufen der Songdaten:", err);
    return {
      streamUrl: STREAM_URL,
      title: "mani.artificial",
      artist: "Digitales Radio Manfred",
      description: "Dein KI-Radio",
      cover: "https://mitreiter.de/wp-content/uploads/2025/04/mani-artificial-logo-1920x1080-_2.png"
    };
  }
}


app.post("/alexa", async (req, res) => {
  console.log("Alexa request received");

  const requestType = req.body && req.body.request && req.body.request.type;
  const intentName = req.body &&
    req.body.request &&
    req.body.request.intent &&
    req.body.request.intent.name;

  console.log("Request type:", requestType);
  console.log("Intent:", intentName);

  console.log("FULL REQUEST BODY:", JSON.stringify(req.body, null, 2));

  
  
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
  console.log(">>> Sending APL Template:");
  console.log(JSON.stringify(require("./apl-template.json"), null, 2));
  console.log(">>> Datasources:");
  console.log(JSON.stringify(response.response.directives[0].datasources, null, 2));
  console.log("NowPlaying data:", nowPlaying);
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

app.get("/alexa", (req, res) => {
  res.send("Alexa endpoint is reachable (GET).");
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port", port);
});
