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
    const champions = ["amumu", "janna", "katarina", "garen", "lux", "gnar", "zed", "annie", "monkeyking", "akali", "camille", "drmundo", "kennen"];
    //받아올 챔 이름들

    function sendQuizSet()
    {
      var quizSet=[];//넘길 퀴즈셋 초기화
      var randomtestIndex=0;

      Chams.find({name:champions[randomtestIndex]}, function(err,docs)
      {
        var randomIndex=[0,1,2,3];
        for(var i=0;i<4;i++)
        {
          quizSet[i]=docs[randomIndex[i]]
        }
        return quizSet;
      });
    }

    socket.on('make', ()=>//make 요청이 오면,
    {
	  console.log('make 실행');
      var quizSet=[];
      quizSet=sendQuizSet();
      socket.to(singleRoomId).emit('get', quizSet);
      //해당 유저의 singleRoom에 get 으로 퀴즈셋 전송
    });
    
    socket.on('disconnect',()=>{
      socket.leave(singleRoomId);
    });
  })

}