import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType, username }) => {
	const getPostEndPoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "Posts":
				return `/api/posts/user/${username}`;
			case "Likes":
				return `/api/posts/likes/${username}`;
			default:
				return "/api/posts/all";
		}
	};

	const post_endpoint = getPostEndPoint();
	const {
		data: posts,
		isError,
		isLoading,
	} = useQuery({
		queryKey: ["posts", feedType],
		queryFn: async () => {
			try {
				const res = await fetch(post_endpoint);
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				console.log(data);

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	return (
		<>
			{isLoading && (
				<div className="flex flex-col justify-center">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && (
				<p className="text-center my-4">No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;
