var express = require('express');
var router = express.Router();
const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.get('/list', async function(req, res) {
	let token = req.headers["token"];
    let page = req.query.page;

    if(page == null) {
        page = 0;
    }

    try {
        let username = await authhelper.getUserName(token);
        let list = await Entity.Notification.findAll({
            where: {
                username: username
            },
            limit: 10,
            offset: page * 10,
            order: [ [ 'created_at', 'DESC' ]]
        });

        

        return res.status(200).json(list); 
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.post('/read', async function(req, res) {
    let id = req.query.id;

    if(id == null || id === "" || id === undefined) {
        return res.status(400).json({
            message: "Error"
        });    
    }

    try {
        let notification = await Entity.Notification.findOne({
            where: {
                id: id
            }
        });

        notification.is_read = true;
        notification.save();

        return res.status(200).json({
            message: "Success"
        });
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });
    }
});

router.post('/readAll', async function(req, res) {
    let token = req.headers["token"];

    try {
        let username = await authhelper.getUserName(token);
        let notifications = await Entity.Notification.findAll({
            where: {
                username: username
            }
        });

        if(notifications != null && notifications != undefined) {
            for(i = 0; i < notifications.length; ++i) {
                notifications[i].is_read = true;
                notifications[i].save();
            }
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


module.exports = router;