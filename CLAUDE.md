# InicioSesionBiblioTK — Servicio de autenticación

Parte del sistema BiblioTK (ver `../CLAUDE.md`). Valida credenciales y gestiona la sesión con un JWT guardado en cookie httpOnly.

- **Puerto:** 3001 (`PORT` en `.env`)
- **Arranque:** `npm run dev` (`node src/app.js`). Solo levanta el servidor si `testConnection()` (un `SELECT 1`) funciona.
- **Dependencias clave:** express 5, mysql2, bcrypt, jsonwebtoken, cookie-parser, cors
- **Variables:** `DB_*` y `JWT_SECRET`

## Estructura

- `src/app.js` — express + `cookieParser()` + CORS con `credentials: true` + router en `/BiblioTK`
- `src/config/db.js` — pool mysql2 y `testConnection()` real
- `src/router/routerBiblioTK.js`
- `src/controllers/login.js` — `Login`, `getCurrentSession`, `Logout`

## Endpoints

| Método | Ruta | Controlador | Descripción |
|---|---|---|---|
| GET | `/BiblioTK/healthLogin` | inline | Health check |
| POST | `/BiblioTK/Login` | `Login` | Body `{ email, contrasena, recordarme }` |
| GET | `/BiblioTK/Sesion` | `getCurrentSession` | Devuelve `{ authenticated: true, user: { email, rol } }` o 401 |
| POST | `/BiblioTK/Logout` | `Logout` | Borra ambas cookies |

### Detalles de la sesión
- Cookie `token_acceso`: `httpOnly`, `secure: false`, `sameSite: "lax"`. Para producción hay un comentario con `secure: true, sameSite: "none"`.
- Cookie `bibliotk_rol`: **no** httpOnly, mismo `maxAge` que `token_acceso`. Solo lleva el rol en texto plano para que el front (la landing) decida a qué app redirigir tras el login sin esperar una segunda llamada a `/Sesion`. No es un límite de seguridad — nunca se lee server-side ni se confía en ella para autorizar nada; cada backend sigue verificando `token_acceso`.
- Payload del JWT: `{ sub: id, email, rol }` (incluye además `iat`/`exp` de `jsonwebtoken`), pero `getCurrentSession` solo devuelve `email` y `rol` al front — `sub`/`iat`/`exp` se quedan en el servidor, no hay razón para exponerlos.
- Duración: `recordarme` → 30 días; sin `recordarme` → **1 minuto** (JWT `"1m"` y cookie de 60 s).
- El front consulta `/Sesion` cada 10 s en las rutas protegidas y redirige a `/login` si recibe 401.

## Problemas conocidos

- Una sesión de 1 minuto sin "recordarme" es muy corta; confirmar si es a propósito (pruebas).
- `package.json` incluye como dependencias `node` y `biome` (el paquete `biome`, no `@biomejs/biome`); parecen agregadas por error.
- Solo este servicio emite y verifica el JWT; los demás backends **no validan** la cookie.
- Este servicio se queda en el puerto 3001 a propósito: no existe el puerto 90000 (TCP topea en 65535 — `net`/`http` de Node lanzan `RangeError: options.port should be >= 0 and < 65536`, y `new URL("http://localhost:90000")` ya lanza `Invalid URL` antes de llegar a cualquier código propio). No es algo que se pueda resolver con configuración.
