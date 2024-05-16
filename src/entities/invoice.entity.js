module.exports = class User {
  firstName;
  lastName;
  phoneNumber;
  country;
  province;
  district;
  addressLine;

  constructor() {}

  setFirstName(firstName) {
    this.firstName = firstName;

    return this;
  }

  setLastName(lastName) {
    this.lastName = lastName;

    return this;
  }

  setPhoneNumber(phoneNumber) {
    this.phoneNumber = phoneNumber;

    return this;
  }

  setCountry(country) {
    this.country = country;

    return this;
  }

  setProvince(province) {
    this.province = province;

    return this;
  }

  setDistrict(district) {
    this.district = district;

    return this;
  }

  setAddressLine(addressLine) {
    this.addressLine = addressLine;

    return this;
  }

  getInstance() {
    return { ...this };
  }
};
