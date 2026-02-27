import { Router } from "express";
import { register, login, logout, refresh } from "../controllers/auth";
import { authenticate } from "../middleware/middleware";
const router = Router();

router.post("/register", register); //For new user :register
router.post("/login", login);       //login
router.post("/logout", authenticate, logout); //logout
router.post("/refresh", refresh);   //refresh

export default router;