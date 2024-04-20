const cloudinary = require("cloudinary").v2;

const uploadImage = async (file) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  cloudinary.uploader
    .upload(file, options)
    .then((result) => {
      console.log("cloundinary success:::", JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.log("cloundinary error:::", error);
    });
};

const deleteImage = async (publicId) => {
  cloudinary.uploader
    .destroy(publicId)
    .then((result) => {
      console.log(
        "cloundinary delete success:::",
        JSON.stringify(result, null, 2)
      );
    })
    .catch((error) => {
      console.log("cloundinary delete error:::", error);
    });
};

module.exports = {
  uploadImage,
  deleteImage,
};
