const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const {
  jwt: { secretKey },
} = require("../config/config.env");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
};

module.exports = (passport) => {
  passport.use(opts, (jwtPayload, next) => {
    console.log({ jwtPayload });

    return next(null, { email: "lxbach@gmail.com" });

    if (!false) {
      return next(null, false);
    }
  });
};
