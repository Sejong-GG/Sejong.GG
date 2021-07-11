const express = require('express');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');

const router = express.Router();

router.get('/', (req,res,next)=>
{
    res.redirect('/main');
})

router.get('/main', async (req, res, next) => {
    
    if(!sessionStorage.getItem('userName'))
    {
        res.render('main');
    }
    else
    {
        res.redirect('/lobby');
    }
});

router.get('/lobby', async(req, res, next) => {
    res.render('lobby', { title: '로비' });
  });

router.get('/crawl', async (req, res, next) => {
    const champ = await Champion.create(crawlData);
    res.redirect('/');
});

module.exports = router;