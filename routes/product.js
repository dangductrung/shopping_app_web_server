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
            let object = {
                price: products[i].current_price,
                delta: products[i].delta,
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

        const currentDate = dateFormat(finalPrd[0].created_at, 'yyyy-mm-dd HH:MM:ss', "isoDateTime");

        var msInDay = 86400000;
        var daysToAdd = 1;
        var now = finalPrd[0].created_at;
        var milliseconds = now.getTime();
        var newMillisecods = milliseconds - msInDay * daysToAdd;
        var newDate = new Date(newMillisecods);
        const previousDateString = dateFormat(newDate, 'yyyy-mm-dd HH:MM:ss');

        const startedDate = new Date(previousDateString);
        const endDate = new Date(currentDate);

        let products = await Entity.Product.findAll({
            where: {
                created_at: {
                    [Op.between]: [previousDateString, currentDate]
                }
            },
            order: [ [ 'delta', 'ASC' ]],
        });

        if(products != undefined && products.length > 0) {
            let limit = process.env.PAGE_LIMIT * 1;
            let offset = page * limit;
            let finalOffset = (products.length > (offset + limit)) ? offset + limit : products.length;

            if(page > 0) {
                offset = offset + 1;
            }

            for(i = 0;i<products.length; ++i) {
                if(products[i].delta < 0) {
                    let object = {
                        product: await producthelper.genPrd(products[i],token),
                        delta: Math.round(products[i].delta * 100) / 100
                    }
                    result.push(object); 
                }

                if(result.length >= finalOffset) {
                    result = result.slice(offset, finalOffset);    
                    return res.status(200).json(result); 
                }
            }
            return res.status(200).json(result); 
        }
        return res.status(200).json(result); 

    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.get('/fluctuation/max', async function(req, res) {
    let token = req.headers["token"];
    try {
        // TODO: Product history price
        let finalPrd = await Entity.Product.findAll({
            limit: 1,
            order: [ [ 'created_at', 'DESC' ]],
        });

        const currentDate = dateFormat(finalPrd[0].created_at, 'yyyy-mm-dd HH:MM:ss', "isoDateTime");

        var msInDay = 86400000;
        var daysToAdd = 7;
        var now = finalPrd[0].created_at;
        var milliseconds = now.getTime();
        var newMillisecods = milliseconds - msInDay * daysToAdd;
        var newDate = new Date(newMillisecods);
        const previousDateString = dateFormat(newDate, 'yyyy-mm-dd HH:MM:ss');

        const startedDate = new Date(previousDateString);
        const endDate = new Date(currentDate);

        let minPrds = await Entity.Product.findAll({
            where: {
                created_at: {
                    [Op.gte]: previousDateString
                }
            },
            order: [ [ 'created_at', 'DESC' ]],
        });

        let temp = [];
        let links = [];
        let minPrd;
        if(minPrds != null && minPrds != undefined && minPrds.length > 0) {
            minPrds.sort(function(a,b){
              return new Date(b.date) - new Date(a.date);
          });

            for(i = 0; i<minPrds.length; i++) {
                if(links.includes(minPrds[i].link) == false) {
                    temp.push(minPrds[i]);
                    links.push(minPrds[i].link);
                }
            }

            minPrd = minPrds[0];
            for(i = 0; i<temp.length; ++i) {
                if(minPrd.delta > temp[i].delta) {
                    minPrd = temp[i];
                }
            }
        }
        
        return res.status(200).json(minPrd); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.get('/fluctuation/max/list', async function(req, res) {
    let token = req.headers["token"];
    let page = req.query.page;

    if(page == null) {
        page = 0;
    }

    let limit = process.env.PAGE_LIMIT*1;
    let offset = page * limit;
    let finalOffset = offset + limit;

    if(page > 0) {
        offset = offset + 1;
    }

    try {
        // TODO: Product history price
        let finalPrd = await Entity.Product.findAll({
            limit: 1,
            order: [ [ 'created_at', 'DESC' ]],
        });

        const currentDate = dateFormat(finalPrd[0].created_at, 'yyyy-mm-dd HH:MM:ss', "isoDateTime");

        var msInDay = 86400000;
        var daysToAdd = 7;
        var now = finalPrd[0].created_at;
        var milliseconds = now.getTime();
        var newMillisecods = milliseconds - msInDay * daysToAdd;
        var newDate = new Date(newMillisecods);
        const previousDateString = dateFormat(newDate, 'yyyy-mm-dd HH:MM:ss');

        const startedDate = new Date(previousDateString);
        const endDate = new Date(currentDate);

        let minPrds = await Entity.Product.findAll({
            where: {
                created_at: {
                    [Op.gte]: previousDateString
                }
            },
            order: [ [ 'created_at', 'DESC' ]],
        });

        let temp = [];
        let links = [];
        let result = [];

        if(minPrds != null && minPrds != undefined && minPrds.length > 0) {
            minPrds.sort(function(a,b){
              return new Date(b.date) - new Date(a.date);
          });

            for(i = 0; i<minPrds.length; i++) {
                if(links.includes(minPrds[i].link) == false) {
                    if(minPrds[i].delta < 0) {
                        result.push(minPrds[i]);
                    }
                    links.push(minPrds[i].link);
                }
            }

            result.sort(function(a,b){
                return a.delta - b.delta;
            });
        }

        finalOffset = result.length > finalOffset ? finalOffset : result.length;
        
        return res.status(200).json(result.slice(offset, finalOffset)); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.post('/track', async function(req, res) {
    let token = req.headers["token"];
    try {
        let id = req.query.product;
        let product = await Entity.Product.findOne({
            where: {
                id: id
            },
        });

        let username = await authhelper.getUserName(token);
        let tracking = await Entity.Track.findOne({
            where: {
                username: username,
                match_id: product.match_id
            }
        });

        if(tracking == undefined || tracking == null) {
            const track = await Entity.Track.create({
                username: username,
                frequency: 1,
                match_id: product.match_id
            });
        } else {
            tracking.frequency = tracking.frequency + 1;
            tracking.save();
        }

        return res.status(200).json({
            message: "Success"
        });

    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.get('/suggest', async function(req, res) {
    let token = req.headers["token"];
    let page = req.query.page;

    if(page == null) {
        page = 0;
    }

    let limit = process.env.PAGE_LIMIT*1;
    let offset = page * limit;
    let finalOffset = offset + limit;

    if(page > 0) {
        offset = offset + 1;
    }

    try {
        let username = await authhelper.getUserName(token);
        let tracks = await Entity.Track.findAll({
            where: {
                username: username
            },
            order: [ [ 'frequency', 'DESC' ]],
        });

        let result = [];
        let links = [];

        if(tracks != null && tracks != undefined) {
            if(tracks.length != 0) {
                for(i = 0; i<tracks.length; ++i) {
                    let products = await Entity.Product.findAll({
                        where: {
                            match_id: tracks[i].match_id
                        },
                        order: [ [ 'created_at', 'DESC' ]],
                    });

                    for(j = 0; j < products.length; ++j) {
                        if(links.includes(products[j].link) == false) {
                            result.push(products[j]);
                            links.push(products[j].link);
                        }
                    }

                    if(result.length > finalOffset) {
                        return res.status(200).json(result.slice(offset, finalOffset));
                    }
                }
            }
        }

        return res.status(200).json(result.slice(offset, result.length));
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});


module.exports = router;