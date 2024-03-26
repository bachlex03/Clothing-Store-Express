const express = require("express");

const app = express();

// Init middleware

// Init database

// Init routes

const server = app.listen(3005, () => {
  console.log(`Server is running in port ${3005}`);
});
