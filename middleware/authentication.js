const jwt = require("jsonwebtoken");
const { tryCatch } = require("./trycatchHandler");

const authentication = tryCatch(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token not provided. Authentication error.",
    });
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally, you can attach the decoded payload to the req.user object
    req.user = decoded;
    console.log(decoded);
    next();
  }
});

module.exports = { authentication };
