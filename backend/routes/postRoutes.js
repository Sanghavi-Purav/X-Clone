import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	commentPost,
	createPost,
	deletePost,
	likePost,
	getAllPost,
	getLikedPosts,
	getFollowingPosts,
	getUserPosts,
} from "../controllers/postControllers.js";

const router = Router();

router.get("/all", protectRoute, getAllPost);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:username", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/like/:id", protectRoute, likePost);
router.post("/comment/:id", protectRoute, commentPost);
export default router;
