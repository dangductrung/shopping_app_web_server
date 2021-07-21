var express = require('express');
var router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');
const Op = Sequelize.Op;

const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");
const dateFormat = require('dateformat');

router.get('/latest', async function(req, res) {
    let token = req.headers["token"];
    try {
        let products = await Entity.Product.findAll(
            {
                where: {
                    match_id: {
                        [Op.not]: null,
                    }
                },
                limit: 30,
                group: ['link'],
                order: [ [ 'created_at', 'DESC' ]],
            }
        );

        let result = [];

        for(j = 0 ; j<products.length; j = j + 1) {
            let product = products[j];

            let key = "shopee";
            if(product.from === "shopee") {
                key = "tiki"
            } else {
                key = "shopee"
            }
            let otherProducts = await Entity.Product.findAll({
                where: {
                    match_id: product.match_id,
                    from: key
                }
            });

            if(otherProducts != null && otherProducts.length > 0) {
                let delta = 99999999;
                let currentProduct = otherProducts[0];

                for(i = 0; i<otherProducts.length; ++i) {
                    if(Math.abs(otherProducts[i].current_price < product.current_price) < delta) {
                        delta = Math.abs(otherProducts[i].current_price - product.current_price);
                        currentProduct = otherProducts[i];
                    }
                }
                result.push(await producthelper.genPrd(currentProduct,token));
            } else {
                result.push(await producthelper.genPrd(product,token));
            }
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

router.post('/info', async function(req, res) {
    try {
        let link = req.body.product;
        let token = req.headers["token"];

        let products = await Entity.Product.findAll(
            {
                where: {
                    link: link,
                },
                limit: 1,
                order: [ [ 'created_at', 'DESC' ]],
            }
        );
        return res.status(200).json(await producthelper.genPrd(products[0],token)); 
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

        // TODO: Matching product history price
        let otherProducts = await Entity.Product.findAll({
            where: {
                match_id: product.match_id,
                from: key
            }
        });

        let other_products = [];

        if(otherProducts != null && otherProducts.length > 0) {
            let delta = 99999999;
            let currentProduct = otherProducts[0];

            for(i = 0; i<otherProducts.length; ++i) {
                if(Math.abs(otherProducts[i].current_price - product.current_price) < delta) {
                    delta = Math.abs(otherProducts[i].current_price - product.current_price);
                    currentProduct = otherProducts[i];
                }
            }
        
            other_products = await Entity.Product.findAll({
                attributes: ["id", "current_price", "created_at", "link"],
                where: {
                    link: currentProduct.link
                },
                order: [ [ 'created_at', 'ASC' ]]
            });
        }


        // TODO: Product history price
        let products = await Entity.Product.findAll({
            attributes: ["id", "current_price", "created_at", "link"],
            where: {
                link: product.link
            },
            order: [ [ 'created_at', 'ASC' ]]
        });


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

router.get('/history', async function(req, res) {
    try {
        let id = req.query.product;
        let product = await Entity.Product.findOne({
            where: {
                id: id
            },
        });

        // TODO: Product history price
        let products = await Entity.Product.findAll({
            where: {
                link: product.link
            },
            order: [ [ 'created_at', 'DESC' ]]
        });

        let result = [];

        for(i = 0;i<products.length; ++i) {
            let delta = 0.0;

            if(i != 0) {
                delta = ((products[i].current_price - products[i-1].current_price) / products[i-1].current_price) * 100;
            } 

            let object = {
                price: products[i].current_price,
                delta: Math.round(delta * 100) / 100,
                created_at: products[i].created_at
            }
            result.push(object);
        }
        return res.status(200).json(result); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.get('/fluctuation', async function(req, res) {
    let token = req.headers["token"];
    let page = req.query.page;

    if(page == null) {
        page = 0;
    }
    try {
        // TODO: Product history price
        let finalPrd = await Entity.Product.findAll({
            limit: 1,
            order: [ [ 'created_at', 'DESC' ]],
        });

        let result = [];

        const currentDate = dateFormat(finalPrd[0].created_at, 'yyyy-mm-dd', "isoDateTime");

        var msInDay = 86400000;
        var daysToAdd = 1;
        var now = finalPrd[0].created_at;
        var milliseconds = now.getTime();
        var newMillisecods = milliseconds + msInDay * daysToAdd;
        var newDate = new Date(newMillisecods);
        const nextDateString = dateFormat(newDate, 'yyyy-mm-dd');

        const startedDate = new Date(currentDate + " 07:00:00");
        const endDate = new Date(nextDateString +  " 07:00:00");

        let products = await Entity.Product.findAll({
            where: {
                created_at: {
                    [Op.between]: [startedDate, nextDateString]
                }
            }
        });

        if(products != undefined && products.length > 0) {
            for(i = 0;i<products.length; ++i) {
                let historyPrds = await Entity.Product.findAll(
                {
                    where: {
                        link: products[i].link,
                    },
                    limit: 2,
                    order: [ [ 'created_at', 'DESC' ]]
                });
                if(historyPrds.length > 1) {
                    let beforePrd = historyPrds[1];
                    let delta = ((products[i].current_price - beforePrd.current_price) / beforePrd.current_price) * 100;
                    if(delta < 0) {
                        let object = {
                            product: await producthelper.genPrd(products[i],token),
                            delta: Math.round(delta * 100) / 100
                        }
                        result.push(object); 
                    }
                }
            }
            let limit = 10;
            let offset = page * limit;
            let finalOffset = (products.length > (offset + limit)) ? offset + limit : products.length;

            result = result.slice(offset, finalOffset);    
        }

        return res.status(200).json(result); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

module.exports = router;