import { useState, useEffect } from "react";
import axios from "axios";

interface PostContext {
    postId: string;
}

interface Comment {
    id: string;
    content: string;
}

const CommentList = ({ postId }: PostContext) => {
    const [comments, setComments] = useState<Comment[]>([]);

    const fetchComments = async () => {
        const response = await axios.get(`http://localhost:4001/posts/${postId}/comments`);
        setComments(response.data);
    };

    useEffect(() => { fetchComments(); }, []);

    const renderComment = (comment: Comment) => (
        <li key={comment.id}>{comment.content}</li>
    );

    return (
        <ul>
            {comments.map(renderComment)}
        </ul>
    );
};

export default CommentList;
