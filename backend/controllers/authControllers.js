import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const handleLogin = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user) {
			return res
				.status(400)
				.json({ error: "Invalid username or the user does not exist" });
		}
		const isPasswordCorrect = await bcrypt.compare(
			password,
			user?.password || ""
		);
		if (!isPasswordCorrect) {
			return res.status(400).json({ error: "Password is incorrect" });
		}
		const token = user.generateToken();

		res.cookie("jwt", token, {
			maxAge: 15 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV !== "development",
		});
		res.status(201).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("error in handlelogin controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const handleSignUp = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(400)
				.json({ error: "User already exists, try using a new email" });
		}

		const exisitingUserName = await User.findOne({ username });
		if (exisitingUserName) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		const newUser = new User({ fullName, username, email, password });
		await newUser.save();
		const token = newUser.generateToken();
		res.cookie("jwt", token, {
			maxAge: 15 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV !== "development",
		});
		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			username: newUser.username,
			email: newUser.email,
			followers: newUser.followers,
			following: newUser.following,
			profileImg: newUser.profileImg,
			coverImg: newUser.coverImg,
			likedposts: newUser.likedposts,
		});
	} catch (error) {
		console.log("error in handlesignup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const handleLogOut = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "logged out successfully" });
	} catch (error) {
		console.log("error in handlelogout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		res.status(201).json(user);
	} catch (error) {
		console.log("error in getme controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
