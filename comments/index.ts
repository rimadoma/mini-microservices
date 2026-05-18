import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomBytes } from 'crypto'

const _port = 4001;

interface CommentBody {
    content: string;
}

interface Comment extends CommentBody {
    id: string;
    postId: string;
}

const _commentsByPostId: Record<string, Comment[]> = {}

const _idLength = 16;

const _idParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', minLength: _idLength, maxLength: _idLength }
    }
} as const;

async function commentRoutes(fastify: FastifyInstance, _: any) {
    fastify.get<{ Params: { id: string } }>('/posts/:id/comments', {
        schema: { params: _idParamsSchema }
    }, async (request, reply) => {
        const comments = _commentsByPostId[request.params.id];
        if (comments === undefined) {
            return reply.code(404).send();
        }
        return comments;
    });

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
        const id = randomBytes(_idLength / 2).toString('hex');
        const { content } = request.body;
        const postId = request.params.id;
        _commentsByPostId[postId] ??= [];
        const comment: Comment = { id, content, postId };
        _commentsByPostId[postId].push(comment);
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
