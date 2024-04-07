const express = require("express");
const authorizationMiddleware = require("../middlewares/authorization.middleware");
const router = express.Router();
const passport = require("passport");

const { getRedis } = require("../db/redis.config");
const client = getRedis().instanceRedis;

router.use(passport.authenticate("jwt", { session: false }));

router.use(authorizationMiddleware(["USER"]));
router.get("/profile", (req, res) => {
  // const fn = async () => {
  //   await client.set("user:1:mailToken", "213423");

  //   const value = await client.get("user:1:mailToken");

  //   console.log({
  //     value,
  //   });
  // };

  // fn();

  res.json({
    message: "test authorization",
  });
});

module.exports = router;
