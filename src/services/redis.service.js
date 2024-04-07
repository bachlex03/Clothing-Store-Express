"use strict";
const client = require("../db/redis.config").getRedis().instanceRedis;

const get = async (key = "") => {
  return await client.get(key);
};

const set = async (key = "", value = "") => {
  await client.set(key, value);

  return;
};

module.exports = {
  get,
  set,
};
