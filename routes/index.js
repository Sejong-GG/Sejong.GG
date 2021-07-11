const express = require('express');
const crawlData = require('../crawl');
const Champion = require('../schemas/champion');

const router = express.Router();

router.get('/', (req,res,next)=>
{
    res.redirect('/main');
})

router.get('/main', async (req, res, next) => {
    console.log(sessionStorage.getItem('userName'));
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


module.exports = router;