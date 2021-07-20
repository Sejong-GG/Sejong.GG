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

	let members = new Map();
	chat.on('connection', (socket) => {
		console.log('chat 네임스페이스에 접속');
		const req = socket.request;
		const roomId = 'open'
		socket.join(roomId);
		chatterIn();

		socket.on('get-totalChatters', () => {
			chat.to(roomId).emit('change-totalChatters', members.size);
		})

		socket.on('disconnect', (data) => {
			console.log('chat 네임스페이스 접속 해제');
			socket.leave(roomId);
			console.log(`연결종료 reason: ${data}`)
			
			if(data === 'client namespace disconnect'){ // 중복 탭 생성시 기존 탭 종료
				chatterOut(true);
			}
		});

		function chatterIn(){
			if(members.has(req.sessionID)){ // 기존 소켓은 연결 종료
				let disconnectSocket = members.get(req.sessionID);
				console.log(`--- 기존 소켓 연결 종료:${disconnectSocket} ---`);
				chat.to(roomId).emit('force-disconnect', disconnectSocket);
			}
			members.set(req.sessionID, socket.id);
			const count = members.size;
			console.log(`참여자 입장(인원: ${count}명)`);

			socket.to(roomId).emit('change-totalChatters', count);
			socket.to(roomId).emit('join', {
				user: 'system',
				chat: `${req.session.userName}님이 입장하셨습니다.`,
			});
			console.log(`--추가--`);
			for (let [key, value] of members){
				console.log(`${key} : ${value}`);
			}console.log(`-------`);
		}

		function chatterOut(forceable=false){
			if(forceable === false){ // 같은 닉네임으로 새 탭 열었을 때 접속자 수 변동 없음
				members.delete(req.sessionID);
				const count = members.size;
				console.log(`참여자 퇴장(인원: ${count}명)`);
				socket.to(roomId).emit('change-totalChatters', count);
			}
			if (members.has(req.sessionID)) {
				socket.to(roomId).emit('exit', {
					user: 'system',
					chat: `${req.session.userName}님이 퇴장하셨습니다.`,
				});
				console.log(`--삭제--`);
				for (let [key, value] of members){
					console.log(`${key} : ${value}`);
				}console.log(`-------`);
			}
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