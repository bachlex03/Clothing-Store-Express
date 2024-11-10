const cloudinaryService = require("../cloudinary/cloudService");
const { OK, CREATED } = require("../core/success.response");

class UploadController {
  async uploadSingle(req, res) {
    new OK({
      message: "Upload successfully",
      statusCode: 200,
      data: await cloudinaryService.uploadSingle(req.file),
    }).send(res);
  }

  async uploadMultiple(req, res) {
    console.log("req.files", req.files);

    new OK({
      message: "Upload successfully",
      statusCode: 200,
      data: await cloudinaryService.uploadMultiple(req.files),
    }).send(res);
  }

  async getAll(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await cloudinaryService.getAll(),
    }).send(res);
  }
}

module.exports = new UploadController();
