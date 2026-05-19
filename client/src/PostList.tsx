import { useState, useEffect } from "react";
import axios from "axios";
import CommentList from "./CommentList";
import CommentCreate from "./CommentCreate";

interface Post {
    id: string;
    title: string;
}

const PostList = () => {
    const [posts, setPosts] = useState<Record<string, Post>>({});

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:4000/posts');

        setPosts(response.data);
    };

    useEffect(() => { fetchPosts(); }, []);

    const renderPost = (post: Post) => (
        <div className="card" style={{ width: '30%', marginBottom: '20 px' }} key={post.id}>
            <div className="card-body">
                <h3>{post.title}</h3>
                <CommentList postId={post.id} />
                <CommentCreate postId={post.id} />
            </div>
        </div>
    );

    const renderedPosts = Object.values(posts).map(renderPost);

    return (
        <div className="d-flex flex-row flex-wrap justify-content-between">
            {renderedPosts}
        </div>
    );
};

export default PostList;
