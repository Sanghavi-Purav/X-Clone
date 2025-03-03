import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
	const queryClient = useQueryClient();
	const { mutate: followUser, isPending } = useMutation({
		mutationFn: async (userId) => {
			try {
				const res = await fetch(`/api/users/follow/${userId}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.message || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);
		},
		onError: () => {},
	});
	return { followUser, isPending };
};

export default useFollow;
