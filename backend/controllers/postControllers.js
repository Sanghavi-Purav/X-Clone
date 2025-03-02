import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notificationModel.js";

export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { img } = req.body;
		const userid = req.user._id.toString();
		const currentuser = await User.findById(userid).select("-password");
		if (!currentuser) {
			return res.status(404).json({ error: "User not found" });
		}
		if (!text && !img) {
			return res
				.status(400)
				.json({ error: "Image and Descreption are required " });
		}

		if (img) {
			const uploadResponse = await cloudinary.uploader.upload(img);
			img = uploadResponse.secure_url;
		}

		const newpost = new Post({ user: userid, text, img });
		await newpost.save();
		return res
			.status(200)
			.json({ message: "Post has been successfully created" });
	} catch (error) {
		console.log("Error in the createPost controller");
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deletePost = async (req, res) => {
	try {
		const { id } = req.params;
		const current_post = await Post.findById(id);
		if (!current_post) {
			return res.status(400).json({ error: "Post not found" });
		}
		if (current_post.user.toString() !== req.user._id.toString()) {
			return res
				.status(400)
				.json({ error: "You are not authorized to delete this post" });
		}
		if (current_post.img) {
			await cloudinary.uploader.destroy(
				current_post.img.split("/").pop().split(".")[0]
			);
		}
		await Post.findByIdAndDelete(id);

		res.status(200).json({ message: "Post has been successfully deleted" });
	} catch (error) {
		console.log("Error in the deletePost controller : ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likePost = async (req, res) => {
	try {
		let notification;
		const { id } = req.params;
		const current_post = await Post.findById(id);
		if (!current_post) {
			return res.status(400).json({ error: "Post does not exist" });
		}
		const isLiking = current_post.likes.includes(req.user._id);
		if (isLiking) {
			await Post.findByIdAndUpdate(id, { $pull: { likes: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { likedposts: id } });
			res.status(200).json({ message: "dislike successfull" });
		} else {
			await Post.findByIdAndUpdate(id, { $push: { likes: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { likedposts: id } });
			notification = new Notification({
				from: req.user._id,
				to: current_post.user,
				type: "like",
			});

			await notification.save();
			res.status(200).json({ message: "like successfull" });
		}
	} catch (error) {
		console.log(`Error in the likePost controller : ${error}`);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const commentPost = async (req, res) => {
	try {
		const { id } = req.params;
		const { comment } = req.body;
		const current_post = await Post.findById(id);
		const current_user = await User.findById(req.user._id);
		if (!current_post) {
			return res.status(400).json({ error: "Post does not exist" });
		}
		let is_comment_included = current_post.comments.some(
			(c) => c.user.toString() === req.user._id.toString() && c.text === comment
		);
		if (is_comment_included) {
			return res
				.status(400)
				.json({ error: "You have already posted this comment" });
		}
		await Post.findByIdAndUpdate(id, {
			$push: { comments: { text: comment, user: req.user._id } },
		});

		res.status(200).json({ message: "comment successfull" });
	} catch (error) {
		console.log("Error in the commentPost controller", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getAllPost = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" });

		if (posts === 0) {
			return res.status(200).json([]);
		}
		res.status(200).json(posts);
	} catch (error) {
		console.log(`Error in the getAllPost controller ${error}`);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getLikedPosts = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		const liked_Posts = await Post.find({ _id: { $in: user.likedposts } })
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" });
		// console.log(liked_Posts);

		res.status(200).json(liked_Posts);
	} catch (error) {
		console.log(`Error in the getlikedposts controller : ${error}`);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const Following = user.following;
		const following_posts = await Post.find({ user: { $in: Following } })
			.sort({
				createdAt: -1,
			})
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});
		res.status(200).json(following_posts);
	} catch (error) {
		console.log(`Error in the getFollowingPosts : ${error}`);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;
		const post_user = await User.findOne({ username });
		console.log(post_user);

		if (!post_user) {
			return res.status(404).json({ error: "User not found" });
		}
		let user_posts = await Post.find({ user: post_user._id })
			.sort({ createdAt: -1 })
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" });
		res.status(200).json(user_posts);
	} catch (error) {
		console.log(`Erro in getUserPosts controller : ${error}`);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
