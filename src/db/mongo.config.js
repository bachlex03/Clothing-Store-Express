const mongoose = require("mongoose");

const {
  db: { host, port, name },
} = require("../config/config.env");

const CONNECTION_STR = `mongodb://${host}:${port}/${name}`;

class Database {
  instance = null;

  constructor() {
    this.connect();
  }

  static async connect(type = "mongodb") {
    this.instance = mongoose
      .connect(CONNECTION_STR, { maxPoolSize: 50 })
      .then((_) => {
        console.log("Connected to database");
      })
      .catch((_) => {
        console.log("Failure connecting to database");
      });
  }

  getInstance() {
    if (!instance) {
      instance = new Database();
    }

    return instance;
  }
}

module.exports = Database;
