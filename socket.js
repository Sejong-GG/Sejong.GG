const SocketIO = require('socket.io');
const connect = require('./schemas/index');
const Chams = require('./schemas/champion');
const Rank = require('./schemas/rank');
const champions = require("./util/champ");

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
  
  	single.on('connection', (socket) => {
    	console.log('싱글서버 접속');
    	const req=socket.request;
    	const singleRoomId=Math.random();
    	console.log(singleRoomId);
    	socket.join(singleRoomId);

    	function sendQuizSet() {
      		var quizSet1=[];
      		var randomtestIndex=0;

      		Chams.find({name:champions[randomtestIndex].eng}, function(err,docs) {
        		var randomIndex=[0,1,2,3];
        		for(var i=0;i<4;i++) {
        			quizSet1[i]=docs[randomIndex[i]]
        		}
        		return quizSet1;
      		});
		}

    	socket.on('make', () => {
			if(!req.session.count||req.session.count==0) {
				req.session.count=0;
			}
				
			var quizSet1=[];
			var randomtestIndex = Math.floor(Math.random() * champions.length);
		
			Chams.find({name:champions[randomtestIndex].eng}, function(err,docs) {
				var randomIndex=[0,1,2,3];
				for(let i = 0; i<4;i++) {
					randomIndex[i] = Math.floor(Math.random() * 10);
				}
				console.log(`randomIndex: ${randomIndex}`);
				for(var i=0;i<4;i++) {
					quizSet1[i]=docs[randomIndex[i]]
				}
				console.log(quizSet1);
				single.in(singleRoomId).emit('get', {quizSet1, randomtestIndex});
			});
    	});

		socket.on('answer', (userAnswer, randomtestIndex) => {
			if(champions[randomtestIndex].kor==userAnswer) {
				single.in(singleRoomId).emit('correction', 'right');
			} else {
				single.in(singleRoomId).emit('correction', 'wrong');
			}
		})

		socket.on('finish', (data) => {
			Rank.create({
				user:data.userName,
				score: parseInt(data.score), 
				time:data.time, 
				createAt:new Date()
			},
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