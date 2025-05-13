import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { envs } from '../config'

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

export const validateJWT = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token no proporcionado o inválido" });
    return; 
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, envs.JWT_SECRET);
    req.user = decoded;
    next(); // Pasar al siguiente middleware
  } catch (err) {
    res.status(401).json({ message: "Token inválido o expirado" });
    return; // Agregamos el return explícito aquí para detener la ejecución
  }
};
