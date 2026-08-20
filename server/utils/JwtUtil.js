const jwt = require("jsonwebtoken");
const MyConstants = require("./MyConstants");

const JwtUtil = {
  genToken(username, password) {
    const token = jwt.sign(
      { username: username, password: password },
      MyConstants.JWT_SECRET,
      { expiresIn: MyConstants.JWT_EXPIRES },
    );
    return token;
  },

  checkToken(req, res, next) {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    // Normalize "Bearer <token>" header if present
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    if (token) {
      jwt.verify(token, MyConstants.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: "Token is not valid",
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.json({
        success: false,
        message: "Auth token is not supplied",
      });
    }
  },
};

module.exports = JwtUtil;
