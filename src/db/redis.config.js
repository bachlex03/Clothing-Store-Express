"use strict";

const redis = require("redis");

let client = {};

const status = {
  CONNECT: "connect",
  END: "end",
  ERROR: "error",
  RECONNECT: "reconnect",
};

const handleEventConnection = (redisClient) => {
  redisClient.on(status.CONNECT, () => {
    console.log("Connection redis - status:::" + status.CONNECT);
  });

  redisClient.on(status.END, () => {
    console.log("Connection redis - status:::" + status.END);
  });

  redisClient.on(status.ERROR, () => {
    console.log("Connection redis - status:::" + status.ERROR);
  });

  redisClient.on(status.RECONNECT, () => {
    console.log("Connection redis - status:::" + status.RECONNECT);
  });
};

const initRedis = () => {
  const instanceRedis = redis.createClient();

  instanceRedis.connect();

  client.instanceRedis = instanceRedis;

  handleEventConnection(instanceRedis);
};

const getRedis = () => client;

const closeRedis = () => {};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
