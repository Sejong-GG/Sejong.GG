const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  const room = io.of('/room');
  const chat = io.of('/chat');
  const main=io.of('/');
  const lobby = io.of('/lobby');

  io.use((socket, next) => {
    //cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  io.on('connection', (socket)=>
  {
    console.log(req.session.name+'님이 네임스페이스 접속');
  })

  main.on('connection', (socket) =>
  {
    console.log(req.session.name+'님이 main 네임스페이스 접속');
    socket.on('disconnect', () => {
      console.log('main 네임스페이스 접속 해제');
    });
  });

  lobby.on('connection', (socket) =>
  {
    console.log(req.session.name+'님이 lobby 네임스페이스 접속');
    socket.on('disconnect', () => {
      console.log('lobby 네임스페이스 접속 해제');
    });
  })
}