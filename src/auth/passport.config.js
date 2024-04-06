const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;

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
    new JwtStrategy(opts, (jwtPayload, next) => {
      return next(null, jwtPayload);

      if (!false) {
        return next(null, false);
      }
    })
  );
};
