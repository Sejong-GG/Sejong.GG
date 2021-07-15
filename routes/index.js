const express = require('express');
const session = require('express-session');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');
const Rank = require('../schemas/rank');
const router = express.Router();

router.get('/', async (req, res, next) => {
    const userName = req.session.userName;
    if(userName) {
        res.render('lobby', { userName: userName })
    } else {
        res.render('login')
    }
});

router.get('/login/:id', (req, res, next) => {
    req.session.userName = req.params.id;
    res.redirect('/');
})

router.get('/room', async (req, res, next) => {
    res.render('room');
});

router.get('/lobby', async (req,res,next) => {
    const userName = req.session.userName;
	res.render('lobby')
});

router.get('/single', async (req,res,next) => {
	res.render('single');
});

router.get('/crawl', async (req, res, next) => {
    await Champion.deleteMany({});
    await Champion.create(crawlData);
    res.redirect('/');
});

router.get('/rank', async (req,res,next) => {
    const data = await Rank.find().sort({score:-1}).limit(10);
	res.render('rank', {data})
})

router.get('/loading', async (req,res,next) => {
	res.render('loading')
})

router.get('/chat', async (req,res,next) => {
	res.render('chat')
})

router.get('/test', async (req,res,next) => {
    await Rank.deleteMany({});

    for(var i = 0; i < 40; i++) {
        await Rank.create({
            user: "유저",
            score: i,
            time: "10",
        });
    }
});

module.exports = router;