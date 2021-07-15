const SocketIO = require('socket.io');
const connect=require('./schemas/index');
const Chams=require('./schemas/champion');
const Rank = require('./schemas/rank');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  const chat = io.of('/chat');
  const single = io.of('/single');

  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  chat.on('connection', (socket) => {
    console.log('chat 네임스페이스에 접속');
    const req = socket.request;
    const roomId = 'open'
    socket.join(roomId);
    socket.to(roomId).emit('join', {
      user: 'system',
      chat: `${req.session.userName}님이 입장하셨습니다.`,
    });

    socket.on('disconnect', () => {
      console.log('chat 네임스페이스 접속 해제');
      socket.leave(roomId);
      socket.to(roomId).emit('exit', {
        user: 'system',
        chat: `${req.session.userName}님이 퇴장하셨습니다.`,
      });
    });
  });
  
  single.on('connection', (socket) => 
  {
    console.log('single 네임스페이스 접속');
    // const req=socket.request; 	   	// FIXME 세션 안 가져와짐
    const singleRoomId=Math.random();	// 랜덤으로 방 아이디 생성
    console.log(`방 id: ${singleRoomId}`);
    socket.join(singleRoomId);
		
    const champions = ["amumu", "janna", "katarina", "garen", "lux", "gnar", "zed", "annie", "monkeyking", "akali", "camille", "drmundo", "kennen"];
    socket.on('make', () => 
	{
      let quizSet=[]; // 넘길 퀴즈셋 초기화
      let randomtestIndex = Math.floor(Math.random() * champions.length);
      
      Chams.find({name:champions[randomtestIndex]}, function(err,docs)
      {
        for(let i = 0; i<4;i++){
		  quizSet[i]=docs[Math.floor(Math.random() * 10)]
        }
        single.in(singleRoomId).emit('get', {quizSet, randomtestIndex}); // get으로 퀴즈셋 전송
      });
    });

    socket.on('answer', (userAnswer, randomtestIndex) =>
    {
      console.log(`userAnswer: ${userAnswer}, index: ${randomtestIndex}, 정답: ${champions[randomtestIndex]}`);
      if(champions[randomtestIndex]==userAnswer) {
        single.in(singleRoomId).emit('correction', 'right'); // correction으로 right 전송
      }
      else{
        single.in(singleRoomId).emit('correction', 'wrong'); // correction으로 wrong 전송
      }
    })
	
	// data: {userName, score(맞춘 개수), time(응시 시간)}
    socket.on('finish', (data) => 
	{
      Rank.create({user: data.userName,
          score: parseInt(data.score), 
		  time:data.time, 
		  createAt:new Date()},
		  function(err) {
            if(err)
              throw err;
        })
    });
    
    socket.on('disconnect',() =>
	{
      socket.leave(singleRoomId);
    });
  })
}