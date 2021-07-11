const express = require('express');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('main');
});

router.get('/crawl', async (req, res, next) => {
    const champ = await Champion.create(crawlData);
    res.redirect('/');
});

module.exports = router;