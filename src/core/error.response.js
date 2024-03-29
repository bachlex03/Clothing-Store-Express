const { ReasonPhrases, StatusCode } = require("../utils/http.code");

class ErrorResponse extends Error {
  constructor({ message, status }) {
    super(message);

    this.status = status;
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    status = StatusCode.BAD_REQUEST
  ) {
    super(message, status);
  }
}

class AuthenticationError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.UNAUTHORIZED,
    status = StatusCode.UNAUTHORIZED
  ) {
    super(message, status);
  }
}

module.exports = {
  BadRequestError,
  AuthenticationError,
};
