import express from 'express';
import routerBiblioTK from './router/routerBiblioTK.js';
import { testConnection } from './config/db.js';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

// Los fronts locales (el superadmin corre en 5175; 5145 queda por compatibilidad)
// más los que se configuren en ALLOWED_ORIGIN_* del .env, igual que en Perfil y Materiales
const allowedOrigins = [
    ...new Set([
        "http://localhost:5172",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5145",
        ...Object.entries(process.env)
            .filter(([key, value]) => key.startsWith("ALLOWED_ORIGIN_") && value)
            .map(([, origin]) => origin.trim()),
    ]),
];

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use('/BiblioTK', routerBiblioTK);

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch {
    process.exitCode = 1;
  }
}

startServer();
