module.exports = class Invoice {
  user; // userId
  products;
  note;
  status;
  total;

  constructor() {}

  setUser(user) {
    this.user = user;

    return this;
  }

  setProducts(products) {
    this.products = products;

    return this;
  }

  setNote(note) {
    this.note = note;

    return this;
  }

  setStatus(status) {
    this.status = status;

    return this;
  }

  setTotal(total) {
    this.total = total;

    return this;
  }

  getInstance() {
    return { ...this };
  }
};
