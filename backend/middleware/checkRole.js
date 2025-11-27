// backend/middleware/checkRole.js
module.exports = function checkRole(...allowedRoles) {
  return (req, res, next) => {
    console.log('[checkRole] req.userId:', req.userId, 'req.userRole:', req.userRole, 'allowedRoles:', allowedRoles);
    if (!req.userRole) {
      console.warn('[checkRole] No se encontró rol en req (posible verifyToken distinto).');
      return res.status(401).json({ mensaje: 'No autorizado: rol no encontrado' });
    }
    if (allowedRoles.length === 0) return next();
    if (!allowedRoles.includes(req.userRole)) {
      console.warn('[checkRole] Acceso denegado. Rol actual:', req.userRole);
      return res.status(403).json({ mensaje: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
};
