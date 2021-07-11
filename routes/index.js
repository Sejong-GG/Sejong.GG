const express = require('express');

const router = express.Router();

router.get('/', (req,res,next)=>
{
    res.redirect('/main');
})

router.get('/main', async (req, res, next) => {
    if(!req.session.name)
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