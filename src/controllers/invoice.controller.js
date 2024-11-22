const invoiceService = require("../services/invoice.service");
const { OK, CREATED } = require("../core/success.response");

class invoiceController {
    async getAllInvoices(req, res) {
        new OK({
            message: "Get all invoices successfully",
            statusCode: 200,
            data: await invoiceService.getAllInvoices(req),
        }).send(res);
    }
}

module.exports = new invoiceController();
