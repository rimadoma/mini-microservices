import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import axios from 'axios';

const _port = 4005;
const _baseAddr = "http://localhost"

async function emitEvent(port: number, event: unknown) {
    try {
        await axios.post(`${_baseAddr}:${port}/events`, event);
    } catch (error) {
        console.error(`Failed to emit event to port ${port}:`, error);
        throw error;
    }
}

async function eventRoutes(fastify: FastifyInstance, _: any) {
    fastify.post<{ Body: any; _Reply: any }>('/events', async (request, reply) => {
        const event = request.body;

        const results = await Promise.allSettled([4000, 4001, 4002].map(port => emitEvent(port, event)));

        if (results.some(r => r.status === 'rejected')) {
            return reply.code(500).send();
        }

        return reply.code(200).send();
    });
}

async function createApp() {
    const fastify = Fastify();
    fastify.register(eventRoutes);
    fastify.register(cors);
    await fastify.listen({ port: _port });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
