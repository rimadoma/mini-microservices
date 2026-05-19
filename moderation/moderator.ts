export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
    id: string;
    postId: string;
    content: string;
}

export function moderateComment(comment: Comment): CommentStatus {
    if (comment.content.toLowerCase().includes("orange")) {
        return 'rejected';
    }
    return 'approved';
}
