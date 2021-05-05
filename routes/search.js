var express = require('express');
var router = express.Router();
const Product = require('../models/product');
const { Sequelize, Model, DataTypes } = require('sequelize');
const Op = Sequelize.Op;
const  authhelper = require("../helper/auth.helper");

router.get('/all', async function(req, res) {
    let token = req.headers["token"];
    if(!(await authhelper.isAuth(token))) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    let keyword = req.body["keyword"];


    try {
        let products = await Product.findAll(
            {
                where: {
                    name: {
                        [Op.like]: "%" + keyword + "%"
                    }
                }
            }
        );
        return res.status(200).json(products);
    }catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

module.exports = router;