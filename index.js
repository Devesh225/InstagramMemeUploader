require("dotenv").config();
const { IgApiClient } = require("instagram-private-api");
const request = require("request-promise");
const { CronJob } = require("cron");

const postToInstagram = async () => {
    try {
        const ig = new IgApiClient();
        ig.state.generateDevice(process.env.IG_USERNAME);

        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

        const memeApiResponse = await request({
            uri: "https://meme-api.com/gimme",
            json: true,
        });

        const memeUrl = memeApiResponse.url;
        const memeCaption = memeApiResponse.title;

        const imageBuffer = await request({
            uri: memeUrl,
            encoding: null,
        });

        // Log image properties for troubleshooting
        console.log("Image Buffer Properties:", imageBuffer.length, imageBuffer.type);

        if (imageBuffer.length === 0) {
            console.error("Error: Empty image buffer received.");
            return;
        }

        const postResponse = await ig.publish.photo({
            file: imageBuffer,
            caption: memeCaption,
        });

        console.log("Posted to Instagram successfully:", postResponse);
    } catch (error) {
        console.error("Error posting to Instagram:", error);
    }
};

// Schedule the postToInstagram function to run every 1 minute
const cronJob = new CronJob("*/1 * * * *", () => {
    postToInstagram();
});

// Start the cron job
cronJob.start();
