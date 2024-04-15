const productService = require("../services/product.service");
const { OK, CREATED } = require("../core/success.response");

class ProductController {
  async create(req, res) {
    new CREATED({
      message: "Create successfully",
      statusCode: 201,
      data: await productService.create(req),
    }).send(res);
  }

  async getAll(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await productService.getAll(),
    }).send(res);
  }

  async getImages(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await productService.getImages(req.params),
    }).send(res);
  }

  async getBySlug(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await productService.getBySlug(req.params),
    }).send(res);
  }
}

module.exports = new ProductController();
