import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import {randomBytes} from 'crypto'

const _port = 4000;

interface PostBody {
    title: string;
}

interface Post extends PostBody {
    id: string;
}

const _posts: Record<string, Post> = {}

async function postRoutes(fastify: FastifyInstance, _: any) {
    fastify.get('/posts', async(_request, _reply) => {
        return _posts;
    });

    fastify.post<{ Body: PostBody; Reply: Post }>('/posts', async (request, reply) => {
        const id = randomBytes(16).toString('hex');
        const {title} = request.body;
        _posts[id] = {
            id,
            title
        };
        return reply.code(201).send(_posts[id]);
    });
}

async function createApp() {
    const fastify = Fastify();
    fastify.register(postRoutes);
    await fastify.listen({ port: _port });
    
    return fastify;
}

  await createApp();
  console.log(`Listening on ${_port}`);