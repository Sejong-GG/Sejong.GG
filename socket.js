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

	let members = [];
	chat.on('connection', (socket) => {
		console.log('chat 네임스페이스에 접속');
		const req = socket.request;
		const roomId = 'open'
		socket.join(roomId);
		chatterIn();

		socket.to(roomId).emit('join', {
			user: 'system',
			chat: `${req.session.userName}님이 입장하셨습니다.`,
		});

		socket.on('disconnect', () => {
			console.log('chat 네임스페이스 접속 해제');
			socket.leave(roomId);
			chatterOut();
			socket.to(roomId).emit('exit', {
				user: 'system',
				chat: `${req.session.userName}님이 퇴장하셨습니다.`,
			});
		});

		function chatterIn(){
			const index = members.indexOf(req.sessionID);
			if ( index === -1) {
				members.push(req.sessionID);
			}
			const count = members.length;
			console.log(`참여자 입장(인원: ${count}명)`);
			socket.to(roomId).emit('change-totalChatters', count);
		}

		function chatterOut(){
			const index = members.indexOf(req.sessionID);
			if (index > -1) {
				members.splice(index, 1);
			}
			const count = members.length;
			console.log(`참여자 퇴장(인원: ${count}명)`);
			socket.to(roomId).emit('change-totalChatters', count);
		}
	});
  
  	single.on('connection', (socket) => {
    	console.log('싱글서버 접속');
    	const req=socket.request;
    	const singleRoomId=Math.random();
    	console.log(singleRoomId);
    	socket.join(singleRoomId);
		const championsIndex = new Array(champions.length).fill(1);

    	socket.on('make', () => {
			if(!req.session.count||req.session.count==0) {
				req.session.count=0;
			}
				
			var quizSet=[];
			var randomtestIndex;
		
			while(true){
				randomtestIndex = Math.floor(Math.random() * champions.length);
				if(championsIndex[randomtestIndex] != 'x'){
					break;
				}
			}

			Chams.find({name:champions[randomtestIndex].eng}, function(err,docs) {
				const targets = new Array(docs.length).fill(1);
				let index;
				for(let i = 0; i<4;i++){
					while(true){
						index = Math.floor(Math.random() * 10);
						if(targets[index] != 'x'){
							break;
						}
					}
					quizSet[i]=docs[index];
					targets[index] = 'x';
				}
				single.in(singleRoomId).emit('get', {quizSet, randomtestIndex});
				championsIndex[randomtestIndex] = 'x';
				console.log(`---------\ntargets: ${targets}\nchampions: ${championsIndex}\n---------`);
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