var express = require('express');
var router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');
const Op = Sequelize.Op;

const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.get('/latest', async function(req, res) {
    let token = req.headers["token"];
    if(!(await authhelper.isAuth(token))) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    try {
        let products = await Entity.Product.findAll(
            {
                limit: 10,
                order: [ [ 'created_at', 'DESC' ]]
            }
        );

        let result = [];
        for(i = 0 ; i<products.length; ++i) {
            result.push(await producthelper.genPrd(products[i],token));
        }
        return res.status(200).json(result); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

module.exports = router;