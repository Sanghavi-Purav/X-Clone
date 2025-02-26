import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;
		const all_notifications = await Notification.find({ to: userId })
			.sort({ createdAt: -1 })
			.populate({ path: "from", select: "username profileImg" });
		await Notification.updateMany({ to: userId }, { read: true });
		res.status(200).json(all_notifications);
	} catch (error) {
		console.log(`Error in the getNotifications Controller ${error}`);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;
		await Notification.deleteMany({ to: userId });
		res.status(200).json({ message: "All notifications are deleted" });
	} catch (error) {
		console.log(`Error in the deleteNotifications Controller ${error}`);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const deleteNotification = async (req, res) => {
	try {
		const notificationId = req.params._id;
		const userId = req.user._id;
		const notification = await Notification.findById(notificationId);
		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}
		if (notification.to.toString() !== userId.toString) {
			return res.status(403).json({
				message: "You are not authorized to delete this notification",
			});
		}

		await Notification.findByIdAndDelete(notificationId);
		res.status(200).json({ message: "Notification deleted successfully" });
	} catch (error) {
		console.log(`Error in the deleteNotification Controller ${error}`);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
