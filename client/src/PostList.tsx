import { useState, useEffect } from "react";
import axios from "axios";
import CommentCreate from "./CommentCreate";

type CommentStatus = 'pending' | 'approved' | 'rejected';

interface Comment {
    id: string;
    content: string;
    status: CommentStatus;
}

const _commentStatusLabels: Record<CommentStatus, string | null> = {
    approved: null,
    pending: 'Pending moderation',
    rejected: 'Rejected',
};

interface Post {
    id: string;
    title: string;
    comments: Comment[];
}

const PostList = () => {
    const [posts, setPosts] = useState<Record<string, Post>>({});

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:4002/posts');
        setPosts(response.data);
    };

    useEffect(() => { fetchPosts(); }, []);

    const renderPost = (post: Post) => (
        <div className="card" style={{ width: '30%', marginBottom: '20 px' }} key={post.id}>
            <div className="card-body">
                <h3>{post.title}</h3>
                {post.comments.length > 0 && (
                    <ul>
                        {post.comments.map(comment => (
                            <li key={comment.id}>
                                {_commentStatusLabels[comment.status]
                                    ? <em>{_commentStatusLabels[comment.status]}</em>
                                    : comment.content}
                            </li>
                        ))}
                    </ul>
                )}
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
