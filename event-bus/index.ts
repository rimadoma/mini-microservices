import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import axios from 'axios';

const _port = 4005;
const _serviceUrls: Record<number, string> = {
    4000: process.env['POSTS_URL'] ?? 'http://localhost:4000',
    4001: process.env['COMMENTS_URL'] ?? 'http://localhost:4001',
    4002: process.env['QUERY_URL'] ?? 'http://localhost:4002',
    4003: process.env['MODERATION_URL'] ?? 'http://localhost:4003',
};

interface Event {
    type: string;
    data: unknown;
}

interface PublishedEvent extends Event {
    offset: number;
}

const _events: PublishedEvent[] = []

async function emitEvent(port: number, event: unknown): Promise<void> {
    try {
        const url = _serviceUrls[port];
        if (url === undefined) return;
        await axios.post(`${url}/events`, event);
    } catch (error) {
        console.error(`Failed to emit event to port ${port}:`, error);
    }
}

async function eventRoutes(fastify: FastifyInstance, _: any): Promise<void> {

    
    fastify.get<{ Querystring: { types?: string; from?: string } }>('/events', async (request, reply) => {
        const { types, from } = request.query;
        const offset = from !== undefined ? parseInt(from, 10) : 0;
        let events = _events.slice(offset);
        if (types !== undefined) {
            const typeList = types.split(',');
            events = events.filter(e => typeList.includes(e.type));
        }
        return reply.code(200).send(events);
    });

    fastify.post<{ Body: Event }>('/events', async (request, reply) => {
        const event = request.body;
        _events.push({ ...event, offset: _events.length });
        // No error handling or keeping track of what's the last event we've successfully sent...
        await Promise.all([4000, 4001, 4002, 4003].map(port => emitEvent(port, event)));
        return reply.code(200).send();
    });
}

async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify();
    fastify.register(eventRoutes);
    fastify.register(cors);
    await fastify.listen({ port: _port, host: '0.0.0.0' });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
