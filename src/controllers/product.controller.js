const productService = require("../services/product.service");
const { OK, CREATED } = require("../core/success.response");

class ProductController {
  async create(req, res) {
    new CREATED({
      message: "Create successfully",
      statusCode: 200,
      data: await productService.create(req.body),
    }).send(res);
  }
}

module.exports = new ProductController();
