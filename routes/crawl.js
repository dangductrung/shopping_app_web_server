var express = require('express');
var router = express.Router();

router.get('/all', async function(req, res) {
    return res.status(200).json(2);
});

module.exports = router;