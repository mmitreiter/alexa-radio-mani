
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const STREAM_URL = "http://radio.mitreiter.de:8000/radio.mp3";

app.post("/alexa", (req, res) => {
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
    res.json(response);
});

app.get("/", (req, res) => {
    res.send("mani.artificial Alexa Stream Endpoint is live.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
