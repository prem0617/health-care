// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // Log the headers to debug
    console.log("Auth Header:", req.headers.authorization);

    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "No token provided",
        headers: req.headers.authorization,
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(500)
      .json({ message: "Authentication error", error: error.message });
  }
};

module.exports = authMiddleware;
