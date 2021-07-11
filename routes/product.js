var express = require('express');
var router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');
const Op = Sequelize.Op;

const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.get('/latest', async function(req, res) {
    let token = req.headers["token"];
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

router.get('/poster', async function(req, res) {
    try {
        let poster = await Entity.Poster.findOne();
        return res.status(200).json(poster); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.get('/chart', async function(req,res) {
    try {
        let id = req.query.product;
        let product = await Entity.Product.findOne({
            where: {
                id: id
            },
        });

        let key = "shopee";
        if(product.from === "shopee") {
            key = "tiki"
        } else {
            key = "shopee"
        }

        let otherProduct = await Entity.Product.findOne({
            where: {
                match_id: product.match_id,
                from: key
            }
        });

        let products = await Entity.Product.findAll({
            attributes: ["id", "current_price", "created_at"],
            where: {
                link: product.link
            },
            order: [ [ 'created_at', 'ASC' ]]
        });

        let other_products = [];

        if(otherProduct != null) {
            other_products = await Entity.Product.findAll({
                attributes: ["id", "current_price", "created_at"],
                where: {
                    link: otherProduct.link
                },
                order: [ [ 'created_at', 'ASC' ]]
            });
        }

        let shopees = [];
        let tikis = [];

        if(product.from === "shopee") {
            shopees = products;
            tikis = other_products;
        } else {
            shopees = other_products;
            tikis = products;
        }

        return res.status(200).json({
            "shopee": shopees,
            "tiki": tikis
        }); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

module.exports = router;