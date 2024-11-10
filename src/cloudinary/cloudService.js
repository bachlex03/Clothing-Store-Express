const cloudinary = require("cloudinary").v2;
const { deleteFile } = require("../utils/handle-os-file");

const uploadSingle = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "chani_store",
  });

  deleteFile(file.path);

  return result;
};

const uploadMultiple = async (files) => {
  const result = await Promise.all(
    files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path, {
        folder: "chani_store",
      });

      deleteFile(file.path);

      return response;
    })
  );

  return result;
};

const deleteImage = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);

    console.log("cloudinary delete success:::", result);

    return response;
  } catch (error) {
    console.log("cloudinary delete error:::", error);
  }
};

const getAll = async () => {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: "chani_store/",
  });

  console.log("cloudinary get all success:::", result);

  return result;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteImage,
  getAll,
};
