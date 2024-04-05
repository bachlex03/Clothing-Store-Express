"use strict";

class AccessService {
  async register({}) {}

  async login() {
    return {
      token: "Random token",
    };
  }
}

module.exports = new AccessService();
