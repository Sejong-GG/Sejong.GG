const SocketIO = require('socket.io');
const connect=require('./schemas/index');
const Chams=require('./schemas/champion');
//Chams는 이제 모델을 담고있다.
//mongoose.model('Champion', championSchema);
const Rank = require('./schemas/rank');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  const chat = io.of('/chat');
  const single = io.of('/single'); // single 네임스페이스

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
    socket.on('make', () => 
	{
      let quizSet=[]; // 넘길 퀴즈셋 초기화
      let randomtestIndex;

	  while(true){
		randomtestIndex = Math.floor(Math.random() * champions.length);
		if(champions[randomtestIndex] != ""){
			break;
		}
	  }

      Chams.find({name:champions[randomtestIndex]}, function(err,docs)
      {
		const targets = [0,1,2,3,4,5,6,7,8,9,10];
		let index;
        for(let i = 0; i<4;i++){
			while(true){
				index = Math.floor(Math.random() * 10);
				if(targets[index] != -1){
					break;
				}
			}
		    quizSet[i]=docs[index];
			targets[index] = -1;
        }
        single.in(singleRoomId).emit('get', {quizSet, randomtestIndex}); // get으로 퀴즈셋 전송
		champions[randomtestIndex] = "";
		console.log(`---------\ntargets: ${targets}\nchampions: ${champions}\n---------`);
      });
    });

    socket.on('answer', (userAnswer, randomtestIndex) =>
    {
	  const champions = ["amumu", "janna", "katarina", "garen", "lux", "gnar", "zed", "annie", "monkeyking", "akali", "camille", "drmundo", "kennen"];
      console.log(`userAnswer: ${userAnswer}, index: ${randomtestIndex}, 정답: ${champions[randomtestIndex]}`);
      
      // FIXME 
      // if(userAnswer)
      // {
      //   userAnswer='amumu';
      //   //인덱스에 맞는 이름을 받아오도록 설정 요망.
      //   //챔 인덱스 보고 챔 이름을 알수 없어요 ㅠㅠ
      // }
      if(champions[randomtestIndex]==userAnswer)//정답이면
      {
        single.in(singleRoomId).emit('correction', 'right');
        //correction으로 맞춘 문제 갯수 전송
      }
      else
      {
        single.in(singleRoomId).emit('correction', 'wrong');
        //correction으로 wrong String 전송
      }
    })

    socket.on('finish', (data)=>
    {
      //answer은 보낸 문제셋의 이름값과 사용자가 보낸 정답지 배열
      //score은 현재 사용자의 점수
      console.log(`finish이벤트 userName:${req.session.userName}`); //FIXME undefined뜹니다.
      Rank.create({user:data.userName,
         score: parseInt(data.score), time:data.time, createAt:new Date()},
         function(err) {
           if(err)
            throw err;
         })
         console.log('저장성공');
    });
    
    socket.on('disconnect',()=>{
      socket.leave(singleRoomId);
    });
  })

}