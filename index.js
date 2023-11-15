require("dotenv").config();
const request = require("request");

const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Listening on Port: ${process.env.PORT}`);
});

const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");
const CronJob = require("cron").CronJob;

const postToInsta = async () => {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

    const options = {
        url: "https://meme-api.com/gimme",
        method: "GET",
        headers: {
            Accept: "application/json",
            "Accept-Charset": "utf-8",
            "User-Agent": "my-reddit-client",
        },
    };

    request(options, async function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let json = JSON.parse(body);
            const imageBuffer = await get({
                uri: json.url,
                encoding: null,
            });

            await ig.publish.photo({
                file: imageBuffer,
                caption: json.title,
            });
        }
    });
};

const cronInsta = new CronJob("*/5 * * * *", async () => {
    postToInsta();
    console.log("POSTED SUCCESSFULLY");
});

cronInsta.start();
