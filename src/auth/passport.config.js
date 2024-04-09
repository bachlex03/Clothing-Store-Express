const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const { AuthenticationError } = require("../core/error.response");

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
      console.log({ jwtPayload });

      return next(null, jwtPayload);
    })
  );
};
