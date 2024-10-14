const cron = require("cron");
const https = require("https");

const URL = "https://campx-f9sv.onrender.com/";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode !== 200) {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.log("Error while sending https request", e);
    });
});

module.exports = job;
