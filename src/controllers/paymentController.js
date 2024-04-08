const paymentService = require("../services/payment.service");
const { OK, CREATED } = require("../core/success.response");

class paymentController {
  async payInvoice(req, res) {
    new CREATED({
      message: "Payment successfully",
      statusCode: 200,
      data: await paymentService.payInvoice(req),
    }).send(res);
  }

  async viewDetails(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await paymentService.viewDetails(req.params),
    }).send(res);
  }
}

module.exports = new paymentController();
