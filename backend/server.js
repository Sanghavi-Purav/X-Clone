import express from "express";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import { connectToMongodb } from "./db/connectToMongodb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notifcationRoutes from "./routes/notificationRoutes.js";
import { v2 as cloudinary } from "cloudinary";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res.send("for testing purposes");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notifcationRoutes);

app.listen(PORT, (req, res) => {
	console.log("server is up and running");
	// console.log(process.env.MONGO_URI);
	connectToMongodb();
});
