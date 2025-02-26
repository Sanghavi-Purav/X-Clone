import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	getUserProfile,
	followUnfollowUser,
	updateUserProfile,
	getSuggestedUsers,
} from "../controllers/userControllers.js";

const router = Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUserProfile);

export default router;
