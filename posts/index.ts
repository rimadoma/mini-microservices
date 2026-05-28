import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import {randomBytes} from 'crypto'
import axios from 'axios';

const _port = 4000;

interface PostBody {
    title: string;
}

interface Post extends PostBody {
    id: string;
}

const _posts: Record<string, Post> = {}

async function postRoutes(fastify: FastifyInstance, _: any): Promise<void> {
    fastify.get('/posts', async(_request, _reply) => {
        return _posts;
    });

    fastify.post<{ Body: { type: string } }>('/events', async (request, reply) => {
        console.log(`posts received ${request.body.type} event`);
        return reply.code(200).send();
    });

    fastify.post<{ Body: PostBody; Reply: Post }>('/posts/create', async (request, reply) => {
        const id = randomBytes(16).toString('hex');
        const post = {
            id,
            title: request.body.title
        }

        _posts[id] = post;
        
        await axios.post(`${process.env['EVENT_BUS_URL'] ?? 'http://localhost:4005'}/events`, {
            type: "PostCreated",
            data: post
        });
        
        return reply.code(201).send(_posts[id]);
    });
}

async function createApp(): Promise<FastifyInstance> {
    const fastify = Fastify();
    
    fastify.register(cors);
    fastify.register(postRoutes);
    await fastify.listen({ port: _port, host: '0.0.0.0' });
    
    return fastify;
}

  await createApp();
  console.log(`Listening on ${_port}`);