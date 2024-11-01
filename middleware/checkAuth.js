const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const isTokenValid = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    req.tokenInformation = isTokenValid;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Invalid Token",
    });
  }
};
