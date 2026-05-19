import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';

const _port = 4002;

interface Comment {
    id: string;
    content: string;
}

interface CommentData extends Comment {
    postId: string;
}

interface Post {
    id: string;
    title: string;
    comments: Comment[];
}

interface Event {
    type: string;
    data: unknown;
}

const _posts: Record<string, Post> = {};

function _validateComment(data: unknown): data is CommentData {
    if (typeof data !== 'object' || data === null
        || !('id' in data) || !('content' in data) || !('postId' in data)) {
        console.error('Invalid CommentCreated data:', data);
        return false;
    }
    const { postId } = data as CommentData;
    if (_posts[postId] === undefined) {
        console.error('Post not found for comment, postId:', postId);
        return false;
    }
    return true;
}

function _validatePost(data: unknown): data is Post {
    if (typeof data !== 'object' || data === null
        || !('id' in data) || !('title' in data)) {
        console.error('Invalid PostCreated data:', data);
        return false;
    }
    return true;
}

const _eventHandlers: Record<string, (data: unknown) => void> = {
    PostCreated: (data) => {
        if (!_validatePost(data)) return;
        _posts[data.id] = { id: data.id, title: data.title, comments: [] };
    },
    CommentCreated: (data) => {
        if (!_validateComment(data)) return;
        _posts[data.postId]!.comments.push({ id: data.id, content: data.content });
    },
};

async function queryRoutes(fastify: FastifyInstance, _: any) {
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

async function createApp() {
    const fastify = Fastify();
    fastify.register(cors);
    fastify.register(queryRoutes);
    await fastify.listen({ port: _port });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
