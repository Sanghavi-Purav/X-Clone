import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	deleteNotifications,
	getNotifications,
} from "../controllers/notificationControllers.js";

const router = Router();
router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);
export default router;
