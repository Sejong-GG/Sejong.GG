const express = require('express');
const session = require('express-session');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');
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
	res.render('single')
});

router.get('/crawl', async (req, res, next) => {
    await Champion.create(crawlData);
    res.redirect('/');
});

router.get('/single', async (req,res,next) => {
	res.render('single')
})

router.get('/rank', async (req,res,next) => {
	res.render('rank')
})

module.exports = router;