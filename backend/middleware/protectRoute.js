import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
	try {
		// console.log(req.cookies);

		// const token = await req.headers.authorization?.split(" ")[1];

		const token = await req.cookies.jwt;
		// console.log(token);

		if (!token) {
			return res.status(401).json({ error: "You need to login or Register" });
		}
		const verifytoken = jwt.verify(token, process.env.JWT_SECRET);
		if (!verifytoken) {
			return res.status(401).json({ error: "Unauthorized: Invalid token" });
		}
		const user = await User.findById(verifytoken.userid).select("-password");
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}
		req.user = user;
		next();
	} catch (error) {
		console.log("Error in protectroute middleware ", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
