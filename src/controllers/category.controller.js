const categoryService = require("../services/category.service");
const { OK, CREATED } = require("../core/success.response");

class CategoryController {
  async create(req, res) {
    new CREATED({
      message: "Create successfully",
      statusCode: 200,
      data: await categoryService.create(req.body),
    }).send(res);
  }

  async getAll(req, res) {
    new CREATED({
      message: "OK",
      statusCode: 200,
      data: await categoryService.getAll(),
    }).send(res);
  }

  async getProductsByCategory(req, res) {
    new CREATED({
      message: "OK",
      statusCode: 200,
      data: await categoryService.getProductsByCategory(req.params),
    }).send(res);
  }

  async withChildren(req, res) {
    new CREATED({
      message: "OK",
      statusCode: 200,
      data: await categoryService.withChildren(),
    }).send(res);
  }
}

module.exports = new CategoryController();
