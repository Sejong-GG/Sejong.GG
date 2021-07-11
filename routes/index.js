const express = require('express');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');

const router = express.Router();

router.get('/', (req,res,next)=>
{
    res.redirect('/login');
})

router.get('/login', async (req, res, next) => {
    
    if(!sessionStorage.getItem('userName'))
    {
        res.render('login');
    }
    else
    {
        res.redirect('/lobby');
    }
});

router.get('/lobby', async(req, res, next) => {
    res.render('lobby', { title: '로비' });
  });

  router.get('/room', async (req, res, next) => {
    res.render('room');
});

router.get('/crawl', async (req, res, next) => {
    const champ = await Champion.create(crawlData);
    res.redirect('/');
});

module.exports = router;