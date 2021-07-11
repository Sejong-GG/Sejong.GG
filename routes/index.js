const express = require('express');

const router = express.Router();

router.get('/', async (req, res, next) => {
    res.render('login');
});

router.get('/room', async (req, res, next) => {
    res.render('room');
});

router.get('/lobby', async (req,res,next) => {
	res.render('lobby')
})
module.exports = router;