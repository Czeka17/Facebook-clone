import classes from './post-item.module.css'
import Image from 'next/image';
import Comments from './comments';
import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
function PostItem(props){
    const commentInputRef = useRef()
    const { data: session, status } = useSession()
    const [comments,setComments] = useState([])
    const [showComments, setShowComments] = useState(false);
    const user = session.user.name
    function sendCommentHandler(event){
        event.preventDefault();

        const enteredComment = commentInputRef.current.value

        if(!enteredComment || enteredComment.trim() === ''){
            return
        }
        props.onAddComment({
            message: enteredComment,
            username: user,
            postId: props.id
        })
    }

    function hideCommentsHandler(){
        setShowComments(false)
    }

    async function showCommentsHandler(event) {
        event.preventDefault();
      
        try {
          const response = await fetch('/api/posts/getComments', {
            method: 'POST',
            body: JSON.stringify({ postId: props.id }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
      
          if (response.ok) {
            const data = await response.json();
            console.log(data); // Log the response data
            const comments = data.commentList;
            setComments(comments);
            setShowComments(true);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong!');
          }
        } catch (error) {
          // Handle error
          console.error(error);
        }
      }
      
    console.log(comments)

    return(
        <li className={classes.item}>
            <div>
                <div className={classes.content}>
                <div className={classes.profile}>
                        <img src={props.profile}/>
                        <h3>{props.author}</h3>
                    </div>
                    <p>{props.title}</p>
                    {props.image && <div className={classes.image}>
                        <Image src={props.image} alt={props.title} width={600} height={600} />
                    </div>}
                </div>
                <div className={classes.reaction}>
                    <div>
                        <p>Like</p>
                    </div>
                    <div>
                        {showComments ?<button onClick={hideCommentsHandler}>Hide Comments</button> : <button onClick={showCommentsHandler}>Show comments</button>}
                    </div>
                </div>
                <form className={classes.commentForm} onSubmit={sendCommentHandler}>
                    <textarea placeholder='comment' id='comment' ref={commentInputRef}></textarea>
                    <button>Submit</button>
                </form>
                {showComments && (
          <Comments comments={comments} />
        )}
            </div>
        </li>
    )
}

export default PostItem;