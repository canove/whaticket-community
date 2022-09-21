const fs = require("firebase-admin");
const serviceAccount = require("./key.json");

module.exports = {
  async database() {
    if (fs.apps.length > 0) {
      return fs.firestore();
    }

    fs.initializeApp({
      credential: fs.credential.cert(serviceAccount)
    });
    return fs.firestore();
  }
};
