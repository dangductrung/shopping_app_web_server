var express = require('express');
var router = express.Router();

const Entity = require('../helper/entity.helper');
const  authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.post('/add', async function(req, res) {
    let token = req.headers["token"];
    let id = req.query.product;
    if(id == null || id === "" || id === undefined) {
        return res.status(400).json({
            message: "Missing product"
        });    
    }
    try {
        let product = await Entity.Product.findOne({
            where: {
                id: id
            }
        });
    
        if(product == null) {
            return res.status(404).json({
                message: "Product not found"
            });    
        }
    
        let username = await authhelper.getUserName(token);
        let follow = await Entity.Follow.findOne({
            where: {
                username: username,
                link: product.link
            }
        });
        if(follow != null) {
            return res.status(400).json({
                message: "Error"
            });  
        }
    
        await Entity.Follow.create({
            username: username,
            link: product.link,
            current_price: product.current_price,
            is_new: false
        });
    
        return res.status(200).json({
            message: "Success"
        });
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });  
    }
});

router.post('/unfollow', async function(req, res) {
    let token = req.headers["token"];

    let id = req.query.product;
    if(id == null || id === "" || id === undefined) {
        return res.status(400).json({
            message: "Missing product"
        });    
    }
    try {
        let product = await Entity.Product.findOne({
            where: {
                id: id
            }
        });
    
        if(product == null) {
            return res.status(404).json({
                message: "Product not found"
            });    
        }
    
        let username = await authhelper.getUserName(token);
        let follow = await Entity.Follow.findOne({
            where: {
                username: username,
                link: product.link
            }
        });
        if(follow == null) {
            return res.status(400).json({
                message: "Error"
            });  
        }
    
        await Entity.Follow.destroy({
            where: 
            {
                username: username,
                link: product.link
            }
        });
    
        return res.status(200).json({
            message: "Success"
        });
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });  
    }
});

router.get('/list', async function(req, res) {
    let token = req.headers["token"];
    let page = req.query.page;

    if(page == null) {
        page = 0;
    }

    try {
        let username = await authhelper.getUserName(token);
        let follows = await Entity.Follow.findAll({
            where: {
                username: username
            },
            limit: 10,
            offset: page * 10
        });

        let result = [];
        if(follows != null) {
            for(i = 0; i<follows.length; i++) {
                let product = await Entity.Product.findAll({
                    limit: 1,
                    where: {
                        link: follows[i].link
                    },
                    order: [ [ 'created_at', 'DESC' ]]
                });

                result.push(await producthelper.genPrd(product[0], token));
            }
        }
        
        return res.status(200).json(result);
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });  
    }
});

module.exports = router;