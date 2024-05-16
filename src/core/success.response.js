const { ReasonPhrases, StatusCode } = require("../utils/http.code");

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatus = ReasonPhrases.OK,
    data = {},
  }) {
    this.message = message || reasonStatus;
    this.status = statusCode;
    this.data = data;
  }

  send(res) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatus = ReasonPhrases.OK,
    data = {},
  }) {
    super({ message, statusCode, reasonStatus, data });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.CREATED,
    reasonStatus = ReasonPhrases.CREATED,
    data = {},
  }) {
    super({ message, statusCode, reasonStatus, data });
  }
}

module.exports = { OK, CREATED };
