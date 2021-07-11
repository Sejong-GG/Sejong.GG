const SocketIO = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  const room = io.of('/room');
  const chat = io.of('/chat');
  const main=io.of('/main');
  const lobby = io.of('/lobby');

  io.use((socket, next) => {
    //cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  io.on('connection', (socket)=>
  {
    const req=socket.request;
    console.log(req.session.name+'님이 네임스페이스 접속');



    socket.on('disconnect', () => {
      console.log(req.session.name+'님의 네임스페이스 접속 해제');
    });
  });

  main.on('connection', (socket) =>
    {
      const req=socket.request;
      console.log(req.session.name+'님이 main 네임스페이스 접속');

      socket.on('setname',(name)=>
      {
        req.session.name=name;
        req.session.save(function(err) {
          if(err)
            throw(err);
        });
        console.log(req.session.name+'님이 닉네임을 설정함');
      });

      socket.on('disconnect', () => {
        console.log(req.session.name+'님의 main 네임스페이스 접속 해제');
      });
    });

    lobby.on('connection', (socket) =>
    {
      const req=socket.request;
      console.log(req.session.name+'님이 lobby 네임스페이스 접속');
      socket.on('disconnect', () => {
        console.log(req.session.name+'님의 lobby 네임스페이스 접속 해제');
      });
    })

  
}