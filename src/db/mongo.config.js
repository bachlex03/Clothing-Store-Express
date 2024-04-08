const mongoose = require("mongoose");

const {
  db: { host, port, name },
} = require("../config/config.env");

const CONNECTION_STR = `mongodb://${host}:${port}/${name}`;

class Database {
  instance = null;

  constructor() {
    Database.connect();
  }

  static async connect(type = "mongodb") {
    await mongoose
      .connect(CONNECTION_STR, { maxPoolSize: 50 })
      .then((connect) => {
        this.instance = connect;

        console.log("Connected to database");
      })
      .catch((_) => {
        console.log("Failure connecting to database");
      });
  }

  static async getInstance() {
    if (!this.instance) {
      this.instance = await new Database();
    }

    return this.instance;
  }
}

module.exports = Database;
