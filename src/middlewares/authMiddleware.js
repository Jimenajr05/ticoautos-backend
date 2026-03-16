const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    // Obtiene el header Authorization de la petición
    const authHeader = req.header("Authorization");

    // Verifica que el header exista y tenga el formato "Bearer token"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token requerido" });
    }

    // Extrae el token quitando la palabra "Bearer "
    const token = authHeader.replace("Bearer ", "");

    // Verifica y decodifica el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca el usuario en la base de datos usando el id del token
    const user = await User.findById(decoded.id).select("-password");

    // Si el usuario no existe
    if (!user) {
      return res.status(401).json({ message: "Token inválido - Usuario no existe" });
    }

    // Guarda el usuario autenticado en req.user para usarlo en otros controladores
    req.user = user;
    
    // Continúa con la siguiente función o ruta
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;