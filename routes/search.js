var express = require('express');
var router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');
const Op = Sequelize.Op;

const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.get('/', async function(req, res) {
    let token = req.headers["token"];
    if(!(await authhelper.isAuth(token))) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

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

        let prd_temp = await Entity.Product.findAll(
            {
                where: {
                    match_id: products[0].match_id,
                },
                order: [ [ 'created_at', 'DESC' ]]
            }
        );

        for(i = 0; i < prd_temp.length; ++i) {
            for(j = i + 1;j < prd_temp.length; ++j) {
                if(prd_temp[j].link === prd_temp[i].link) {
                    prd_temp = removeA(prd_temp, prd_temp[j]);
                }
            }
        }
        prd_temp = prd_temp.sort((prd1,prd2) => prd1.current_price > prd2.current_price ? 1 : (prd1.current_price < prd2.current_price) ? -1 : 0);

        prd_temp = prd_temp.slice(page * 10, (page * 10 + process.env.PAGE_LIMIT) > prd_temp.length ? prd_temp.length : page * 10 + process.env.PAGE_LIMIT);

        let result = [];
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

module.exports = router;