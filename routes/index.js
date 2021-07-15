const express = require('express');
const session = require('express-session');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');
const Rank = require('../schemas/rank');
const Chat = require('../schemas/chat');
const router = express.Router();

// 메인
router.get('/', async (req, res, next) => {
    const userName = req.session.userName;
    if(userName) {
        res.render('lobby', { userName: userName })
    } else {
        res.render('login')
    }
});

// 로그인
router.post('/login', (req, res, next) => {
    console.log(req.body.userName);
	try {
        req.session.userName = req.body.userName;
	    res.send('ok');
        //res.redirect('/');
	} catch (error) {
	    console.error(error);
	    next(error);
	}
})

// 로비
router.get('/lobby', async (req,res,next) => {
	res.render('lobby')
});

// 싱글 게임
router.get('/single', async (req,res,next) => {
	res.render('single');
});

// 데이터 크롤링
router.get('/crawl', async (req, res, next) => {
    await Champion.deleteMany({});
    await Champion.create(crawlData);
    res.redirect('/');
});

// 로딩
router.get('/loading', async (req,res,next) => {
	res.render('loading')
})

// 랭킹
router.get('/rank', async (req,res,next) => {
    const data = await Rank.find().sort({score:-1}).limit(10);
	res.render('rank', {data})
})

// 공개 채팅방
router.get('/chat', async (req,res,next) => {
    const userName = req.session.userName;
	res.render('chat', {userName : userName})
})

router.post('/chat/data', async (req, res, next) => {
	console.log('submit 요청 받음');
	try {
	  	const chat = await Chat.create({
		user: req.session.userName,
		chat: req.body.chat,
	  });
	    req.app.get('io').of('/chat').to("open").emit('chat', chat);
	    console.log('/chat 요청 보냄');
	    res.send('ok');
	} catch (error) {
	    console.error(error);
	    next(error);
	}
});

module.exports = router;