const express = require('express');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('login');
});

router.get('/room', async (req, res, next) => {
    res.render('room');
});

router.get('/lobby', async (req,res,next) => {
	res.render('lobby')
});

router.get('/single', async (req,res,next) => {
	res.render('single')
});

router.get('/crawl', async (req, res, next) => {
    const champ = await Champion.create(crawlData);
    res.redirect('/');
});

module.exports = router;