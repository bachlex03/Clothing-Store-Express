const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const { AuthenticationError } = require("../core/error.response");
const userService = require("../services/user.service");

const {
  jwt: { secretKey },
} = require("../config/config.env");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
};

module.exports = (passport) => {
  passport.use(
    "jwt",
    new JwtStrategy(opts, async (jwtPayload, next) => {
      console.log("jwtPayload", jwtPayload);
      const user = await userService.findOneAuth(jwtPayload.email);

      return next(null, user);
    })
  );
};
