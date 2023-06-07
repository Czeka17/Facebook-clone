import classes from "./post-item.module.css";
import Comments from "./comments";
import React, { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AiOutlineSend, AiFillHeart, AiOutlineEdit, AiOutlineComment } from "react-icons/ai";
import {BsTrash} from 'react-icons/bs'
import { GoKebabHorizontal } from "react-icons/go";
import Link from "next/link";
import PostModal from "../layout/post-modal";

interface Comment {
	userId: string;
	user: {
		name: string;
		image: string;
	};
	_id: string;
	message: string;
}
interface Like {
	likedBy: string;
}

interface PostItemProps {
	id: string;
	profile: string;
	author: string;
	title: string;
	image: {
		url: string | undefined;
		type: "image" | "video" | "gif" | undefined;
	};
	time: string;
	comments?: Comment[];
	likes: Like[];
	onAddComment: (comment: {
		message: string;
		username: string;
		postId: string;
	}) => void;
	onDeletePost: (postId: string) => void;
	onUpdatePost: (postId: string, newTitle: string, newImage: { url: string | undefined, type: "image" | "video" | "gif" | undefined }) => void;
}
function PostItem(props: PostItemProps) {
	const commentInputRef = useRef<HTMLTextAreaElement>(null);
	const { data: session, status } = useSession();
	const [comments, setComments] = useState<Comment[]>([]);
	const [showComments, setShowComments] = useState(false);
	const [likesCount, setLikesCount] = useState(props.likes.length);
	const [showModal, setShowModal] = useState(false)
	const [isLikedByUser, setIsLikedByUser] = useState(
		props.likes.some((item) => item.likedBy === session?.user?.name)
	);
	const [showOptions, setShowOptions] = useState(false);
	function handleShowModal(){
		setShowModal(true)
	}
	function handleHideModal(){
		setShowModal(false)
	}
	const handleKebabMenuClick = () => {
		setShowOptions(!showOptions);
	};
  const kebabMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (kebabMenuRef.current && !kebabMenuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
	const user = session?.user?.name || "";
	function sendCommentHandler(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const enteredComment = commentInputRef.current?.value;

		if (!enteredComment || enteredComment.trim() === "") {
			return;
		}
		props.onAddComment({
			message: enteredComment,
			username: user,
			postId: props.id,
		});
		setComments(comments);

		commentInputRef.current.value = "";
	}

	function hideCommentsHandler() {
		setShowComments(false);
	}

	async function likePostHandler() {
		try {
			const response = await fetch("/api/posts/postLikes", {
				method: "POST",
				body: JSON.stringify({
					postId: props.id,
					username: session?.user?.name,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (response.ok) {
				const data = await response.json();
				if (isLikedByUser) {
					setLikesCount((prevCount) => prevCount - 1);
					setIsLikedByUser(false);
				} else {
					setLikesCount((prevCount) => prevCount + 1);
					setIsLikedByUser(true);
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function showCommentsHandler(
		event: React.MouseEvent<HTMLButtonElement>
	) {
		event.preventDefault();

		try {
			const response = await fetch("/api/posts/getComments", {
				method: "POST",
				body: JSON.stringify({ postId: props.id }),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				console.log(data);
				const comments = data.commentList;
				setComments(comments);
				setShowComments(true);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || "Something went wrong!");
			}
		} catch (error) {
			console.error(error);
		}
	}

	const deleteCommentHandler = async (commentId: string) => {
		try {
			const response = await fetch("/api/posts/deleteComment", {
				method: "DELETE",
				body: JSON.stringify({ postId: props.id, commentId }),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				console.log(data);
				const comments = data.commentList;
				setComments(comments);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || "Something went wrong!");
			}
		} catch (error) {
			console.error(error);
		}
	};
	const deletePostHandler = async (postId:string) => {
		try {
			const response = await fetch("/api/posts/addPost", {
				method: "DELETE",
				body: JSON.stringify({postId:postId}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				console.log(data);
				props.onDeletePost(postId);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || "Something went wrong!");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const commentsLength = props.comments?.length ?? 0;

	const createdAt = props.time;

	const createdDate = new Date(createdAt);

	const currentDate = new Date();
	const timeDiff = currentDate.getTime() - createdDate.getTime();

	const seconds = Math.floor(timeDiff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	let formattedTime = "";
	if (days > 0) {
		formattedTime = `${days} day${days > 1 ? "s" : ""} ago`;
	} else if (hours > 0) {
		formattedTime = `${hours} hour${hours > 1 ? "s" : ""} ago`;
	} else if (minutes > 0) {
		formattedTime = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	} else {
		formattedTime = `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
	}

	return (
		<li className={classes.item}>
			<div>
				<div className={classes.content}>
					<div className={classes.profileContainer}>
						<Link href={`/${encodeURIComponent(props.author)}`}>
							<div className={classes.profile}>
								<img
									src={props.profile}
									alt={props.author}
								/>
								<div className={classes.postAuthor}>
									<span>{props.author}</span>
									<span className={classes.postDate}>{formattedTime}</span>
								</div>
							</div>
						</Link>
						{props.author === session?.user?.name && (
						<div className={classes.kebabMenu} ref={kebabMenuRef}>
							<GoKebabHorizontal onClick={handleKebabMenuClick} />
							{showOptions && (
								<div className={classes.options}>
									<button className={classes.optionButton} onClick={handleShowModal}><AiOutlineEdit />Edit</button>
                  <hr/>
									<button className={classes.optionButton} onClick={() =>deletePostHandler(props.id)}><BsTrash />Delete</button>
								</div>
							)}
						</div>)}
					</div>
					<p>{props.title}</p>
					{props.image &&
					(props.image.type === "image" || props.image.type === "gif") ? (
						<div className={classes.image}>
							<img
								src={props.image.url}
								alt={props.title}
							/>
						</div>
					) : (
						props.image &&
						props.image.type === "video" && (
							<div className={classes.image}>
								{" "}
								<video
									controls
									className={classes.video}
								>
									<source
										src={props.image.url}
										type='video/mp4'
									/>
									Your browser does not support the video tag.
								</video>
							</div>
						)
					)}
				</div>
				<div className={classes.reaction}>
					<div className={classes.like}>
						<button onClick={likePostHandler}>
							<AiFillHeart
								className={`${classes["heart-icon"]} ${
									isLikedByUser ? classes["liked"] : "disliked"
								} `}
							/>
							<p>{likesCount}</p>
						</button>
					</div>
					<div className={classes.showComment}>
						{showComments ? (
							<button onClick={hideCommentsHandler}><AiOutlineComment/> ({commentsLength})</button>
						) : (
							<button onClick={showCommentsHandler}>
								<AiOutlineComment/> ({commentsLength})
							</button>
						)}
					</div>
				</div>
				<form
					className={classes.commentForm}
					onSubmit={sendCommentHandler}
				>
					<textarea
						placeholder='comment'
						id='comment'
						ref={commentInputRef}
						rows={2}
					></textarea>
					<button>
						<AiOutlineSend />
					</button>
				</form>
				{showComments && (
					<Comments
						comments={comments}
						user={user}
						onDeleteComment={deleteCommentHandler}
					/>
				)}
			</div>
				{showModal && <PostModal image={props.image} title={props.title} id={props.id} onHideModal={handleHideModal} onUpdatePost={props.onUpdatePost} />}
		</li>
	);
}

export default PostItem;
