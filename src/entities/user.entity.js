module.exports = class User {
  firstName;
  lastName;
  email;
  password;
  verified;
  roles;

  constructor() {}

  setFirstName(value) {
    this.firstName = value;

    return this;
  }

  setLastName(value) {
    this.lastName = value;

    return this;
  }

  setEmail(value) {
    this.email = value;

    return this;
  }

  setPassword(value) {
    this.password = value;

    return this;
  }

  getInstance() {
    return { ...this };
  }
};
