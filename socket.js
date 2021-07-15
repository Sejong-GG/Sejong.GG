const SocketIO = require('socket.io');
const connect=require('./schemas/index');
const Chams=require('./schemas/champion');
//Chams는 이제 모델을 담고있다.
//mongoose.model('Champion', championSchema);
const Rank = require('./schemas/rank');

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
      var quizSet1=[];//넘길 퀴즈셋 초기화
      var randomtestIndex=0;

      Chams.find({name:champions[randomtestIndex]}, function(err,docs)
      {
        var randomIndex=[0,1,2,3];
        for(var i=0;i<4;i++)
        {
          quizSet1[i]=docs[randomIndex[i]]
        }
        //console.log(quizSet);
        return quizSet1;
      });
    }

    // var quizSet=[];
    // quizSet=sendQuizSet();
    // socket.emit('get', quizSet);

    socket.on('make', ()=>//make 요청이 오면,
    {
      if(!req.session.count||req.session.count==0)
        req.session.count=0;
      //세션카운트값이 없으면 0으로 초기화, 0이어도 0 초기화
      var quizSet1=[];//넘길 퀴즈셋 초기화
      var randomtestIndex=0;

      Chams.find({name:champions[randomtestIndex]}, function(err,docs)
      {
        var randomIndex=[0,1,2,3];
        for(var i=0;i<4;i++)
        {
          quizSet1[i]=docs[randomIndex[i]]
        }
        console.log(quizSet1);
        single.in(singleRoomId).emit
        ('get', {quizSet1, randomtestIndex});//get으로 퀴즈셋 전송
      });
    });

    socket.on('answer', (userAnswer, randomtestIndex) =>
    {
      if(userAnswer)
      {
        userAnswer='amumu';
        //인덱스에 맞는 이름을 받아오도록 설정 요망.
        //챔 인덱스 보고 챔 이름을 알수 없어요 ㅠㅠ
      }
      if(champions[randomtestIndex]==userAnswer)//정답이면
      {
        req.session.count+=1;
        single.in(singleRoomId).emit
        ('response', req.session.count);
        //response로 맞춘 문제 갯수 전송
        //count가 10이어도 클라이언트에서 finish 호출하도록 작성
      }
      else
      {
        req.session.count=0;
        single.in(singleRoomId).emit
        ('response', 'wrong');
        //response로 wrong String 전송
        //클라이언트는 넘어온 값이 wrong이면 클라이언트에서 finish 호출
      }
    })

    socket.on('finish', (score,time)=>
    {
      //answer은 보낸 문제셋의 이름값과 사용자가 보낸 정답지 배열
      //score은 현재 사용자의 점수
      
      Rank.create({user:req.session.userName,
         score:score, time:time, createAt:new Date()},
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