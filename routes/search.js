var express = require('express');
var router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');
const Op = Sequelize.Op;

const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.post('/', async function(req, res) {
    let token = req.headers["token"];
    let keyword = req.body["keyword"];
    let page = req.query.page;

    if(page == null) {
        page = 0;
    }

    try {
        keyword = keyword.split("'").join("");
        let products = await Entity.Product.findAll({
            where: Sequelize.literal(`MATCH (name) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE)`),
        });
        if(products.length === 0) {
            return res.status(200).json([]);
        }

        let count = 0;
        let prd_temp = [];

        while(!(prd_temp.length >= (page + 1) * process.env.PAGE_LIMIT || count == products.length)) {
            prd_temp = prd_temp.concat(await getList(products[count]));
            ++count;
        }

        prd_temp.sort(function(a,b){
          return new Date(b.created_at) - new Date(a.created_at);
        });

        let limit = process.env.PAGE_LIMIT*1;
        let offset = page * limit + 1;
        let finalOffset = (prd_temp.length > (offset + limit)) ? (offset + limit) : prd_temp.length;

        let result = [];

        for(i = 0; i<prd_temp.length ; ++i) {
            if(result.length == finalOffset) {
                return res.status(200).json(result.slice(offset, finalOffset));
            }
            let flag = false;
            for(j = 0; j<result.length; ++j) {
                if(result[j].link == prd_temp[i].link) {
                    flag = true;
                }
            }

            if(flag == false) {
                result.push(await producthelper.genPrd(prd_temp[i], token));
            }
        }
        return res.status(200).json(result);
    }catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

async function getList(product) {
    let prd_temp = await Entity.Product.findAll(
        {
            where: {
                match_id: product.match_id,
            },
            order: [ [ 'created_at', 'DESC' ]],
            group: ['link'],
        }
    );

    return prd_temp;
}

module.exports = router;