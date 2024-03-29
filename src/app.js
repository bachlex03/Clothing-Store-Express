const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const env = require("dotenv");

const app = express();
env.config();

// Init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Init database

// Init routes
const router = require("./routes");
app.use("/", router);

// Handle error

module.exports = app;
