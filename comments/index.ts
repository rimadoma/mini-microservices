import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomBytes } from 'crypto'
import axios from 'axios';

const _port = 4001;

interface CommentBody {
    content: string;
}

interface Comment extends CommentBody {
    id: string;
    postId: string;
}

const _commentsByPostId: Record<string, Comment[]> = {}

const _postIdLength = 32;

const _idParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', minLength: _postIdLength, maxLength: _postIdLength }
    }
} as const;

async function commentRoutes(fastify: FastifyInstance, _: any) {
    fastify.get<{ Params: { id: string } }>('/posts/:id/comments', {
        schema: { params: _idParamsSchema }
    }, async (request, reply) => {
        const comments = _commentsByPostId[request.params.id];
        if (comments === undefined) {
            return [];
        }
        return comments;
    });

    fastify.post('/events', async (_request, reply) => { return reply.code(200).send(); })

    fastify.post<{ Params: { id: string }; Body: CommentBody; Reply: Comment }>('/posts/:id/comments', {
        schema: {
            params: _idParamsSchema,
            body: {
                type: 'object',
                required: ['content'],
                properties: {
                    content: { type: 'string', minLength: 1 }
                }
            }
        }
    }, async (request, reply) => {
        const id = randomBytes(16).toString('hex');
        const { content } = request.body;
        const postId = request.params.id;
        _commentsByPostId[postId] ??= [];
        const comment: Comment = { id, content, postId };
        _commentsByPostId[postId].push(comment);

        await axios.post("http://localhost:4005/events", {
            type: "CommentCreated",
            data: comment
        });

        return reply.code(201).send(comment);
    });
}

async function createApp() {
    const fastify = Fastify();
    fastify.register(cors);
    fastify.register(commentRoutes);
    await fastify.listen({ port: _port });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
