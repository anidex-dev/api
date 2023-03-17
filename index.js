const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require('morgan');
const app = express();
require('dotenv').config()
const redis = require("redis");


app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'))

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

app.get("/", (req, res) => {
  res.redirect("https://www.youtube.com/watch?v=4J0eu55kYWY")
});

// routes
require("./src/routes/search")(app);

// set port, listen for requests
const PORT = process.env.PORT || 4482;
app.listen(PORT, () => {


});