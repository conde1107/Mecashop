//backend/middleware/auth.js

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const rawToken = req.headers["authorization"];

  if (!rawToken)
    return res.status(403).json({ mensaje: "No se proporcionó el token" });

  const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.rol;

    next();
  } catch (error) {
    console.error("Token inválido:", error.message);
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

module.exports = verifyToken;
exports.verifyToken = verifyToken;
