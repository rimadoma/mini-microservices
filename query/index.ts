import Fastify from 'fastify';
import cors from '@fastify/cors';

const _port = 4002;

async function createApp() {
    const fastify = Fastify();
    fastify.register(cors);
    await fastify.listen({ port: _port });
    return fastify;
}

await createApp();
console.log(`Listening on ${_port}`);
