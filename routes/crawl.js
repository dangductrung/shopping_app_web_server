var express = require('express');
var router = express.Router();
var Product = require("../model/product.js");

router.get('/all', async function(req, res) {
    var products = await Product.findAll();

    return res.status(200).json(products);
});

module.exports = router;