import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomBytes } from 'crypto'
import axios from 'axios';

const _port = 4001;

type CommentStatus = 'pending' | 'approved' | 'rejected';

interface CommentBody {
    content: string;
}

interface Comment extends CommentBody {
    id: string;
    postId: string;
    status: CommentStatus;
}

interface ModeratedComment extends Comment {}

const _commentsByPostId: Record<string, Comment[]> = {}

const _postIdLength = 32;

const _idParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', minLength: _postIdLength, maxLength: _postIdLength }
    }
} as const;

async function _emitCommentUpdated(comment: Comment): Promise<void> {
    await axios.post(`${process.env['EVENT_BUS_URL'] ?? 'http://localhost:4005'}/events`, {
        type: "CommentUpdated",
        data: comment
    });
}

const _eventHandlers: Record<string, (data: unknown) => Promise<void>> = {
    CommentModerated: async (data) => {
        const { id, postId, status } = data as ModeratedComment;
        const comment = _commentsByPostId[postId]?.find(c => c.id === id);
        if (comment === undefined) {
            console.error('Comment not found for moderation, id:', id);
            return;
        }
        comment.status = status;
        await _emitCommentUpdated(comment);
    },
};

async function commentRoutes(fastify: FastifyInstance, _: any): Promise<void> {
    fastify.get<{ Params: { id: string } }>('/posts/:id/comments', {
        schema: { params: _idParamsSchema }
    }, async (request, _reply) => {
        const comments = _commentsByPostId[request.params.id];
        if (comments === undefined) {
            return [];
        }
        return comments;
    });

    fastify.post<{ Body: { type: string; data: unknown } }>('/events', async (request, reply) => {
        const { type, data } = request.body;
        console.log(`comments received ${type} event`);
        await _eventHandlers[type]?.(data);
        return reply.code(200).send();
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
        const id = randomBytes(16).toString('hex');
        const { content } = request.body;
        const postId = request.params.id;
        _commentsByPostId[postId] ??= [];
        const comment: Comment = { id, content, postId, status: 'pending' };
        _commentsByPostId[postId].push(comment);

        await axios.post(`${process.env['EVENT_BUS_URL'] ?? 'http://localhost:4005'}/events`, {
            type: "CommentCreated",
            data: comment
        });

        return reply.code(201).send(comment);
    });
}

async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify();
    fastify.register(cors);
    fastify.register(commentRoutes);
    await fastify.listen({ port: _port });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
