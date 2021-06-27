var express = require('express');
var router = express.Router();

const Entity = require('../helper/entity.helper');
const  authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.post('/add', async function(req, res) {
    let token = req.headers["token"];
    let id = req.body.product;
    let title = req.body.title;
    let content = req.body.content;

    if(id == null || id === "" || id === undefined) {
        return res.status(400).json({
            message: "Missing product"
        });    
    }

    if(title == null || title === "" || title === undefined) {
        return res.status(400).json({
            message: "Missing title"
        });    
    }

    if(content == null || content === "" || content === undefined) {
        return res.status(400).json({
            message: "Missing content"
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
    
        await Entity.Report.create({
            product_id: id,
            title: title,
            content: content
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

module.exports = router;