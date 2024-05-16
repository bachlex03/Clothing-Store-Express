const paymentService = require("../services/payment.service");
const { OK, CREATED } = require("../core/success.response");

class paymentController {
  async payInvoice(req, res) {
    new CREATED({
      message: "Processing payment...",
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

  async updateAddresses(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await paymentService.updateAddresses(req),
    }).send(res);
  }
}

module.exports = new paymentController();
