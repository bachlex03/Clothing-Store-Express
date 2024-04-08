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
}

module.exports = new CategoryController();
