var express = require('express');
var router = express.Router();
const { Sequelize, Model, DataTypes } = require('sequelize');
const Op = Sequelize.Op;

const Entity = require('../helper/entity.helper');
const  authhelper = require("../helper/auth.helper");

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
        let products = await Entity.Product.findAll(
            {
                where: {
                    name: {
                        [Op.like]: "%" + keyword + "%"
                    }
                },
                limit: 10,
                offset: page * 10
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