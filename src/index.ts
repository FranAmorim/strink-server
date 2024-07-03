import Fastify from 'fastify'
import { torrentRoutes, torrentRoutesOptions } from './torrent/torrent.js';

const server = Fastify({
  logger: true
})

server.register(torrentRoutes, torrentRoutesOptions);

// Run the server!
try {
  await server.listen({ port: 5000 })
} catch (err) {
  server.log.error(err)
  process.exit(1)
}