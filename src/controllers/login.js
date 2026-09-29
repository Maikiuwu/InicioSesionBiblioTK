import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

export async function Login(req, res) {
  try {
    const { email, contrasena, recordarme } = req.body;

    const [usuarios] = await pool.query(
      "SELECT id, email, password, rol FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    const usuario = usuarios[0];

    const isMatch = usuario
      ? await bcrypt.compare(contrasena, usuario.password)
      : false;

    if (!isMatch) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const tiempoSesion = recordarme ? "30d" : "60m";
    const duracionCookie = recordarme
      ? 30 * 24 * 60 * 60 * 1000
      : 60 * 60 * 1000;

    const token = jwt.sign(
      {
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: tiempoSesion,
      }
    );

    res.cookie("token_acceso", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: duracionCookie,
    });

    // No es un límite de seguridad: solo le dice al front a qué app redirigir sin esperar /Sesion
    res.cookie("bibliotk_rol", usuario.rol, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: duracionCookie,
    });

    /*en produccion
    secure: true,
      sameSite: "none"*/

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
}

export function getCurrentSession(req, res) {
  const token = req.cookies.token_acceso;

  if (!token) {
    return res.status(401).json({
      message: "No hay una sesión activa",
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      authenticated: true,
      user: { email: user.email, rol: user.rol },
    });
  } catch {
    return res.status(401).json({
      message: "La sesión expiró",
    });
  }
}

export function Logout(req, res) {
  res.clearCookie("token_acceso", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("bibliotk_rol", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Sesión cerrada correctamente",
  });
}