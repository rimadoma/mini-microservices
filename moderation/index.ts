import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import axios from 'axios';
import { moderateComment } from './moderator.js';
import type { Comment, CommentStatus } from './moderator.js';

const _port = 4003;

interface Event {
    type: string;
    data: unknown;
}

async function _emitCommentModerated(comment: Comment, status: CommentStatus): Promise<void> {
    await axios.post(`${process.env['EVENT_BUS_URL'] ?? 'http://localhost:4005'}/events`, {
        type: 'CommentModerated',
        data: { ...comment, status }
    });
}

const _eventHandlers: Record<string, (data: unknown) => Promise<void>> = {
    CommentCreated: async (data) => {
        const comment = data as Comment;

        // Simulates waiting for human moderator input
        const delay = Math.random() * 50_000 + 10_000;
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log("Comment moderated");

        await _emitCommentModerated(comment, moderateComment(comment));
    },
};

async function moderationRoutes(fastify: FastifyInstance, _: any): Promise<void> {
    fastify.post<{ Body: Event }>('/events', async (request, reply) => {
        const { type, data } = request.body;
        const handler = _eventHandlers[type];
        if (handler !== undefined) {
            console.log(`moderation received ${type} event`);
            handler(data);
        }
        return reply.code(200).send();
    });
}

async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify();
    fastify.register(cors);
    fastify.register(moderationRoutes);
    await fastify.listen({ port: _port, host: '0.0.0.0' });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
