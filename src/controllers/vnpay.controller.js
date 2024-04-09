const paymentService = require("../vnpay/vnpay.service");
const { OK, CREATED } = require("../core/success.response");

class paymentController {
  async createPaymentUrl(req, res) {
    new CREATED({
      message: "Send payment url successfully",
      statusCode: 200,
      data: await paymentService.createPaymentUrl(req),
    }).send(res);
  }
}

module.exports = new paymentController();
