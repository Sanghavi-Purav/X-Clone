import { Router } from "express";
import {
	getMe,
	handleLogin,
	handleLogOut,
	handleSignUp,
} from "../controllers/authControllers.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = Router();
router.get("/me", protectRoute, getMe);
router.post("/signup", handleSignUp);
router.post("/login", handleLogin);
router.post("/logout", handleLogOut);

export default router;
