"use strict";

class AccessService {
  async signUp() {}

  async signIn() {
    return {
      token: "Random token",
    };
  }
}

module.exports = new AccessService();
