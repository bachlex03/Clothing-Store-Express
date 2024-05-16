module.exports = class Product {
  name;
  description;
  quantity;
  price;
  category;
  type;
  brand;
  code;
  gender;
  color;
  sizes = [];
  images;
  status;

  constructor() {}

  setName(value) {
    this.name = value;

    return this;
  }

  setDescription(value) {
    this.description = value;

    return this;
  }

  setQuantity(value) {
    this.quantity = value;

    return this;
  }

  setPrice(value) {
    this.price = value;

    return this;
  }

  setCategory(value) {
    this.category = value;

    return this;
  }

  setType(value) {
    this.type = value;

    return this;
  }

  setBrand(value) {
    this.brand = value;

    return this;
  }

  setCode(value) {
    this.code = value;

    return this;
  }

  setGender(value) {
    this.gender = value;

    return this;
  }

  setColor(value) {
    this.color = value;

    return this;
  }

  setSizes(value) {
    this.sizes = value;

    return this;
  }

  setImages(value) {
    this.images = value;

    return this;
  }

  setStatus(value) {
    this.status = value;

    return this;
  }

  getInstance() {
    return { ...this };
  }

  validateInfo() {}
};
