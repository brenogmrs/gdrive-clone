import fs from 'fs';
import https from 'https';
import { Server } from 'socket.io';
import { logger } from './logger.js';
import { Routes } from './routes.js';

const PORT = process.env.PORT || 3000;

const localhostSSL = {
  key: fs.readFileSync('./certificates/key.pem'),
  cert: fs.readFileSync('./certificates/cert.pem'),
};

const routes = new Routes();

const server = https.createServer(localhostSSL, routes.handler.bind(routes));

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: false,
  },
});

routes.setSocketInstace(io);

io.on('connection', (socket) => {
  logger.info(`someone has connected: ${socket.id}`);
});

const bootstrap = () => {
  const { address, port } = server.address();
  logger.info(`app running at https://${address}:${port}`);
};

server.listen(PORT, bootstrap);
