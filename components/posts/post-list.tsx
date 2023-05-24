import PostItem from "./post-item"
import classes from './posts-list.module.css'
import NewPost from "./add-post"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface Post {
    _id: string;
    message: string;
    image: string;
    name: string;
    userImage: string;
    createdAt: string;
    commentList: Comment[];
  }
  
  interface Comment {
    _id: string;
    userId: string;
    message: string;
    user: {
      name: string;
      image: string;
    };
  }

  interface PostsListProps {}
function PostsList(props: PostsListProps){

    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { data: session, status } = useSession()
    const name = session?.user?.name || ''


    useEffect(() => {
        fetch('/api/posts/addPost').then(response => response.json()).then((data) => {
            setPosts(data.posts);
            setIsLoading(false)
        })
    }, [])


function addPostHandler(postData:any) {
    fetch('/api/posts/addPost', {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
            'Content-Type': 'application/json'
          }
    }).then((response) => {
        if(response.ok){
            return response.json()
        }
        return response.json().then(data => {
            throw new Error(data.message || 'Something went wrong!')
          })
    })
}

function addCommentHandler(commentData:any){
    fetch('/api/posts/addComment', {
        method: 'POST',
        body: JSON.stringify(commentData),
        headers: {
            'Content-Type': 'application/json'
          }
    }).then(response => {
        if(response.ok){
            return response.json()
        }
        return response.json().then(data => {
            throw new Error(data.message || 'Something went wrong!')
          })
    })
}


console.log(posts)
return <section className={classes.postContainer}>
    {isLoading ? <div className={classes.loading}><p>POST<span>IT</span></p></div> :<div>
    <div>
        <NewPost onAddPost={addPostHandler} name={name} userImage={session?.user?.image || ''}/>
    </div>
    <ul className={classes.list}>
    {posts.map((post) =>(
        <PostItem key={post._id} id={post._id} title={post.message} image={post.image} author={post.name} profile={post.userImage} time={post.createdAt} onAddComment={addCommentHandler} comments={post.commentList}/>
    ))}
</ul>
    </div>}
</section>
}

export default PostsList