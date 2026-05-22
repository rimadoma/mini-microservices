import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import axios from 'axios';

const _port = 4005;
const _baseAddr = "http://localhost"

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
        await axios.post(`${_baseAddr}:${port}/events`, event);
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

        await Promise.all([4000, 4001, 4002, 4003].map(port => emitEvent(port, event)));

        _events.push({ ...event, offset: _events.length });

        return reply.code(200).send();
    });
}

async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify();
    fastify.register(eventRoutes);
    fastify.register(cors);
    await fastify.listen({ port: _port });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
