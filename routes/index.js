const express = require('express');
const session = require('express-session');
const crawlData = require('../util/crawler');
const Champion = require('../schemas/champion');
const Rank = require('../schemas/rank');
const Chat = require('../schemas/chat');
const router = express.Router();

// 메인
router.get('/', async (req, res, next) => {
    if(req.session.userName) {
        res.render('lobby')
    } else {
        res.render('login')
    }
});

// 로그인
router.post('/login', (req, res, next) => {
	try {
        req.session.userName = req.body.userName;
	    res.send('ok');
	} catch (error) {
	    console.error(error);
	    next(error);
	}
})

// 싱글 게임
router.get('/single', async (req,res,next) => {
    const serverip = process.env.SERVER_IP;
    if(req.session.userName) {
	    res.render('single', {serverip : serverip});
    } else {
        res.render('login');
    }
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
    let ranksLeft = await Rank.find().sort({score:-1, time:1}).limit(5);
    let ranksRight = await Rank.find().sort({score:-1, time:1}).skip(5).limit(5);
    const leftSize = ranksLeft.length;
    const rightSize = ranksRight.length;

    if(leftSize < 5) {
        for(let i = 0; i < 5 - leftSize; i++) {
            ranksLeft.push({dummy:true})
        }
    }

    if(rightSize < 5) {
        for(let i = 0; i < 5 - rightSize; i++) {
            ranksRight.push({dummy:true})
        }
    }

	res.render('rank', {ranksLeft, ranksRight})
})

// 채팅
router.get('/chat', async (req,res,next) => {
    const userName = req.session.userName;
    const serverip = process.env.SERVER_IP;
    if(userName) {
        res.render('chat', {userName : userName, serverip : serverip})
    } else {
        res.render('login')
    }
})

// 채팅 데이터
router.post('/chat/data', async (req, res, next) => {
	try {
	  	const chat = await Chat.create({
		user: req.session.userName,
		chat: req.body.chat,
	  });
	    req.app.get('io').of('/chat').to("open").emit('chat', chat);
	    res.send('ok');
	} catch (error) {
	    console.error(error);
	    next(error);
	}
});

module.exports = router;