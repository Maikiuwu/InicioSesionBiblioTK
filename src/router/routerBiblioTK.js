import { Router } from "express";
import {
  Login,
  getCurrentSession,
  Logout,
} from "../controllers/login.js";

const router = Router();

router.get("/healthLogin", (req, res) => {
  res.status(200).json({
    message: "API is healthy Login",
  });
});

router.post("/Login", Login);
router.get("/Sesion", getCurrentSession);
router.post("/Logout", Logout);

export default router;