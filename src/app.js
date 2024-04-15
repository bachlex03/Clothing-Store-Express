const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const env = require("dotenv");
const cors = require("cors");
const passport = require("passport");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDocs = require("swagger-jsdoc");
const path = require("path");

const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

env.config();

// config Swagger
const options = require("./config/config.swagger");
const specs = swaggerJsDocs(options);
app.use("/swagger/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// config handlebars
const { engine: handlebars } = require("express-handlebars");
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources/views"));

// config static file
app.use(express.static(path.join(__dirname, "public")));

app.get("/payment", (req, res) => {
  res.render("test");
});

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
// init passport-jwt
require("./auth/passport.config")(passport);
app.use(passport.initialize());

// Init database
const Database = require("./db/mongo.config");
Database.connect();
const redis = require("./db/redis.config");
redis.initRedis();

// Init routes
const router = require("./routes");
app.use("/", router);

// Handle error
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;

  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
