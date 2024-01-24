const jwt = require("jsonwebtoken");

module.exports = {
  signToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {
        name: userId,
      };
    });
    // jwt.sign(payload, secret, (err, token) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     resolve(token);
    //   }
    // });
  },
};
