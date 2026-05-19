import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';

const _port = 4002;

type CommentStatus = 'pending' | 'approved' | 'rejected';

interface StoredComment {
    id: string;
    content: string;
    status: CommentStatus;
}

interface Comment {
    id: string;
    postId: string;
    content: string;
    status: CommentStatus;
}

interface Post {
    id: string;
    title: string;
    comments: StoredComment[];
}

interface Event {
    type: string;
    data: unknown;
}

const _posts: Record<string, Post> = {};

function _validateComment(data: unknown): data is Comment {
    if (typeof data !== 'object' || data === null
        || !('id' in data) || !('postId' in data) || !('content' in data) || !('status' in data)) {
        console.error('Invalid Comment data:', data);
        return false;
    }
    return true;
}

function _validatePost(data: unknown): data is Post {
    if (typeof data !== 'object' || data === null
        || !('id' in data) || !('title' in data)) {
        console.error('Invalid Post data:', data);
        return false;
    }
    return true;
}

const _eventHandlers: Record<string, (data: unknown) => void | Promise<void>> = {
    PostCreated: (data) => {
        if (!_validatePost(data)) return;
        _posts[data.id] = { id: data.id, title: data.title, comments: [] };
    },
    CommentCreated: (data) => {
        if (!_validateComment(data)) return;
        const post = _posts[data.postId];
        if (post === undefined) {
            console.error('Post not found for comment, postId:', data.postId);
            return;
        }
        post.comments.push({ id: data.id, content: data.content, status: data.status });
    },
    CommentUpdated: (data) => {
        if (!_validateComment(data)) return;
        const post = _posts[data.postId];
        if (post === undefined) {
            console.error('Post not found for comment, postId:', data.postId);
            return;
        }
        const comment = post.comments.find(c => c.id === data.id);
        if (comment === undefined) {
            console.error('Comment not found for update, id:', data.id);
            return;
        }
        comment.status = data.status;
    },
};

async function queryRoutes(fastify: FastifyInstance, _: any): Promise<void> {
    fastify.get('/posts', async (_request, _reply) => {
        return _posts;
    });

    fastify.post<{ Body: Event }>('/events', async (request, reply) => {
        const { type, data } = request.body;
        const handler = _eventHandlers[type];
        if (handler === undefined) {
            console.error('Unknown event type:', type);
        } else {
            console.log(`query received ${type} event`);
            handler(data);
        }
        return reply.code(200).send();
    });
}

async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify();
    fastify.register(cors);
    fastify.register(queryRoutes);
    await fastify.listen({ port: _port });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
