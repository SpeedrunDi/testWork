const jwt = require('jsonwebtoken');

module.exports.getToken = (username, expirationTime) => {
  return jwt.sign({username}, process.env.TOKEN_KEY, {
    expiresIn: expirationTime,
  })
};
