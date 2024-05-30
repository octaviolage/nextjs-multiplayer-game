'use server';
import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const backEndPlayers = {};
const backEndProjectiles = {};

const SPEED = 5;
const RADIUS = 10;
let projectileId = 0;

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('a user connected');

    io.emit('updatePlayers', backEndPlayers);

    socket.on('shoot', ({ x, y, angle }) => {
      projectileId++;
      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
      };
      backEndProjectiles[projectileId] = {
        x,
        y,
        velocity,
        playerId: socket.id,
      };
    });

    socket.on('initGame', ({ username, width, height }) => {
      backEndPlayers[socket.id] = {
        x: 1024 * Math.random(),
        y: 576 * Math.random(),
        color: `hsl(${360 * Math.random()}, 100%, 50%)`,
        sequenceNumber: 0,
        score: 0,
        username,
        canvas: { width, height },
        radius: RADIUS,
      };
    });

    socket.on('disconnect', (reason) => {
      console.log(reason);
      delete backEndPlayers[socket.id];
      io.emit('updatePlayers', backEndPlayers);
    });

    socket.on('keydown', ({ keycode, sequenceNumber }) => {
      const backEndPlayer = backEndPlayers[socket.id];
      if (!backEndPlayer) return;

      backEndPlayer.sequenceNumber = sequenceNumber;
      switch (keycode) {
        case 'KeyW':
          backEndPlayer.y -= SPEED;
          break;
        case 'KeyA':
          backEndPlayer.x -= SPEED;
          break;
        case 'KeyS':
          backEndPlayer.y += SPEED;
          break;
        case 'KeyD':
          backEndPlayer.x += SPEED;
          break;
      }

      const playerSides = {
        left: backEndPlayer.x - backEndPlayer.radius,
        right: backEndPlayer.x + backEndPlayer.radius,
        top: backEndPlayer.y - backEndPlayer.radius,
        bottom: backEndPlayer.y + backEndPlayer.radius,
      };

      if (playerSides.left < 0) backEndPlayer.x = backEndPlayer.radius;
      if (playerSides.right > 1024) backEndPlayer.x = 1024 - backEndPlayer.radius;
      if (playerSides.top < 0) backEndPlayer.y = backEndPlayer.radius;
      if (playerSides.bottom > 576) backEndPlayer.y = 576 - backEndPlayer.radius;
    });
  });

  setInterval(() => {
    for (const id in backEndProjectiles) {
      const projectile = backEndProjectiles[id];
      projectile.x += projectile.velocity.x;
      projectile.y += projectile.velocity.y;

      const PROJECTILE_RADIUS = 5;
      if (
        projectile.x - PROJECTILE_RADIUS >= backEndPlayers[projectile.playerId]?.canvas?.width ||
        projectile.x + PROJECTILE_RADIUS <= 0 ||
        projectile.y - PROJECTILE_RADIUS >= backEndPlayers[projectile.playerId]?.canvas?.height ||
        projectile.y + PROJECTILE_RADIUS <= 0
      ) {
        delete backEndProjectiles[id];
        continue;
      }

      for (const playerId in backEndPlayers) {
        const backEndPlayer = backEndPlayers[playerId];

        const DISTANCE = Math.hypot(
          projectile.x - backEndPlayer.x,
          projectile.y - backEndPlayer.y
        );

        if (
          DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
          projectile.playerId !== playerId
        ) {
          if (backEndPlayers[projectile.playerId]) backEndPlayers[projectile.playerId].score++;

          delete backEndProjectiles[id];
          delete backEndPlayers[playerId];
          break;
        }
      }
    }

    io.emit('updateProjectiles', backEndProjectiles);
    io.emit('updatePlayers', backEndPlayers);
  }, 15);

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
