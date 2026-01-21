const cron = require("node-cron");

//run at 8 am every days
cron.schedule("0 8 * * *", () => {
  console.log("running a task every minute");
});
