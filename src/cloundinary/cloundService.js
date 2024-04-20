const cloudinary = require("cloudinary").v2;

const uploadImage = async (file) => {
  const options = {
    overwrite: true,
  };

  try {
    const response = await cloudinary.uploader.upload(file, options);

    console.log("cloundinary success:::", response);

    return response;
  } catch (error) {
    console.log("cloundinary error:::", error);
  }
};

const deleteImage = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);

    console.log("cloundinary delete success:::", result);

    return response;
  } catch (error) {
    console.log("cloundinary delete error:::", error);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
