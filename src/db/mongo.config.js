const mongoose = require("mongoose");

const {
  db: { host, port, name },
} = require("../config/config.env");

const CONNECTION_STR = `mongodb://${host}:${port}/${name}`;
// const CONNECTION_STR = `mongodb+srv://chani:MdamxFGAGqHGCREe@chani-store.j28z8.mongodb.net/Clothing_DEV?retryWrites=true&w=majority&appName=chani-store`;

console.warn("host::", host);
console.warn("port::", port);
console.warn("name::", name);

class Database {
  instance = null;

  constructor() {
    Database.connect();
  }

  static async connect(type = "mongodb") {
    console.warn("CONNECTION_STR::", CONNECTION_STR);

    await mongoose
      .connect(CONNECTION_STR, { maxPoolSize: 50 })
      .then((connection) => {
        this.instance = connection;

        console.log("Connected to database");
      })
      .catch((_) => {
        console.log("Failure connecting to database");
      });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }

    return this.instance;
  }
}

module.exports = Database;
