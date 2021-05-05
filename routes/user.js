var express = require('express');
var router = express.Router();
const User = require('../models/user');

router.get('/all', async function(req, res) {
    let users = await User.findAll();
    return res.status(200).json(users);
});

module.exports = router;