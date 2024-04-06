const express = require("express");
const authorizationMiddleware = require("../middlewares/authorization.middleware");
const router = express.Router();
const passport = require("passport");

router.use(passport.authenticate("jwt", { session: false }));

router.use(authorizationMiddleware(["USER"]));
router.get("/profile", (req, res) => {
  res.json({
    message: "test authorization",
  });
});

module.exports = router;
