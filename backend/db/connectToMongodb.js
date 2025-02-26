import mongoose from "mongoose";

const connectToMongodb = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGO_URI);
		console.log(
			"connected successfully with the database",
			connect.connection.host
		);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

export { connectToMongodb };
