import { response } from "express";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username }).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user);
	} catch (error) {
		console.log("error in getUserProfile controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const usertomodify = await User.findById(id);
		const currentuser = await User.findById(req.user._id);
		let notification;

		if (!usertomodify || !currentuser) {
			return res.status(400).json({ message: "User not found" });
		}
		if (id === req.user._id.toString) {
			return res
				.status(400)
				.json({ message: "You can't follow/unfollow yourself" });
		}
		console.log(id, req.user._id);

		const isFollowing = currentuser.following.includes(id);
		if (isFollowing) {
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			notification = new Notification({
				from: req.user._id,
				to: id,
				type: "unfollow",
			});
			await notification.save();
			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

			notification = new Notification({
				from: req.user._id,
				to: id,
				type: "follow",
			});

			await notification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("error in followUnfollowUser controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateUserProfile = async (req, res) => {
	try {
		const {
			fullName,
			username,
			email,
			currentpassword,
			newpassword,
			bio,
			link,
		} = req.body;
		console.log(email);

		let { profileImg, coverImg } = req.body;
		const userid = req.user._id;
		let user = await User.findById(userid);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		console.log(newpassword, currentpassword);

		if (
			(!currentpassword && newpassword) ||
			(currentpassword && !newpassword)
		) {
			return res
				.status(400)
				.json({ message: "Please provide both current and new password" });
		}

		if (currentpassword && newpassword) {
			if (currentpassword === newpassword) {
				return res.status(404).json({
					message: "New password cannot be the same as the old password",
				});
			}
			const ismatch = await bcrypt.compare(currentpassword, user.password);
			if (!ismatch) {
				return res
					.status(400)
					.json({ message: "Current Password is incorrect" });
			}
			if (newpassword.length < 6) {
				return res
					.status(400)
					.json({ message: "Password must be atleast 6 characters long" });
			}
			user.password = newpassword;
		}
		if (profileImg) {
			if (user.profileImg) {
				await cloudinary.uploader.destroy(
					user.profileImg.split("/").pop().split(".")[0]
				);
			}
			const uploadedresponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedresponse.secure_url;
			user.profileImg = profileImg;
		}
		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(
					user.coverImg.split("/").pop.split(".")[0]
				);
			}
			const coverimgresponse = await cloudinary.uploader.upload(coverImg);
			coverImg = coverimgresponse.secure_url;
			user.coverImg = coverImg;
		}
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;

		await user.save();
		user.password = null;
		res.status(200).json({ message: "Profile updated successfully", user });
	} catch (error) {
		console.log("error in updateUserProfile controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		const userid = req.user._id;
		const usersfollowedbyme = await User.findById(userid).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userid },
				},
			},
			{ $sample: { size: 10 } },
		]);

		const filteredusers = users.filter(
			(user) => !usersfollowedbyme.following.includes(user._id)
		);
		const suggestedusers = filteredusers.slice(0, 4);
		suggestedusers = suggestedusers.map((user) => {
			user.password = null;
			return user;
		});
		res.status(200).json(suggestedusers);
	} catch (error) {
		console.log("error in getSuggestedUsers controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
