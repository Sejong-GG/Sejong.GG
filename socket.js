const SocketIO = require('socket.io');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  const room = io.of('/room');
  const chat = io.of('/chat');
  const single = io.of('/single'); // single 네임스페이스

  io.use((socket, next) => {
    //cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  single.on('connection', (socket)=>
  {
    console.log('싱글서버 접속');
    const req=socket.request;
    const singleRoomId=Math.random();
    //랜덤 난수가 완벽히 똑같기 힘든 점을 이용
    //굳이 프론트에서 링크로 요청을 받지 않고 난수로 아이디 생성
    console.log(singleRoomId);
    socket.join(singleRoomId);

    socket.on('disconnect',()=>{
      socket.leave(singleRoomId);
    });
  })

}