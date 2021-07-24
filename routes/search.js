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
        let products = await Entity.Product.findAll({
            where: Sequelize.literal(`MATCH (name) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE)`),
        });
        if(products.length === 0) {
            return res.status(200).json([]);
        }

        let count = 0;

        let result = [];
        let prd_temp = [];

        while(!(prd_temp.length >= (page + 1) * process.env.PAGE_LIMIT || count == products.length)) {
            prd_temp = prd_temp.concat(await getList(products[count]));
            ++count;
        }

        for(i = 0; i < prd_temp.length; ++i) {
            let temp = prd_temp[i];
            prd_temp = prd_temp.filter(function(item) {
                return item.link !== prd_temp[i].link;
            });
            prd_temp.push(temp);
        }


        prd_temp = prd_temp.sort((prd1,prd2) => prd1.current_price > prd2.current_price ? 1 : (prd1.current_price < prd2.current_price) ? -1 : 0);
        prd_temp = prd_temp.slice(page * process.env.PAGE_LIMIT, (page + 1) * process.env.PAGE_LIMIT > prd_temp.length ? prd_temp.length : page * process.env.PAGE_LIMIT + process.env.PAGE_LIMIT);

        for(i = 0; i < prd_temp.length; ++i) {
            result.push(await producthelper.genPrd(prd_temp[i], token));
        }

        return res.status(200).json(result);
    }catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

async function getList(product) {
    let prd_temp = await Entity.Product.findAll(
        {
            where: {
                match_id: product.match_id,
            },
            order: [ [ 'created_at', 'DESC' ]]
        }
    );

    return prd_temp;
}

module.exports = router;