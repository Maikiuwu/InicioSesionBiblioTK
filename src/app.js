import 'dotenv/config';
import express from 'express';
import routerBiblioTK from './router/routerBiblioTK.js';
import { testConnection } from './config/db.js';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = Object.entries(process.env)
  .filter(([key, value]) => key.startsWith('ALLOWED_ORIGIN_') && value)
  .map(([, origin]) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);;

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
