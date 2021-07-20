var express = require('express');
var router = express.Router();

const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");

router.post('/add', async function(req, res) {
    let fcmtoken = req.query.token;
    let userName = await authhelper.getUserName(req.headers["token"]);

    if(fcmtoken == null || fcmtoken == undefined || fcmtoken == "") {
    	return res.status(400).json({
            "message": "FCM Token rỗng."
        });
    }

    try {
        let checkEntity = await Entity.FCM.findOne({
        	where: {
        		username: userName,
        		key: fcmtoken
        	}
        });
        if(checkEntity !=  null || checkEntity != undefined) {
	        return res.status(200).json({
	            message: "Thành công"
	        });        	
        } else {
            await Entity.FCM.destroy({
                where: {
                    username: userName,
                }
            });
        	await Entity.FCM.create({
        		username: userName,
        		key: fcmtoken
        	});
        	return res.status(200).json({
	            message: "Thành công"
	        }); 
        }
    }catch(e) {
    	return res.status(400).json({
            message: e.toString()
        });  
    }
});

router.delete('/remove', async function(req, res) {
    let fcmtoken = req.query.token;
    let userName = await authhelper.getUserName(req.headers["token"]);

    if(fcmtoken == null || fcmtoken == undefined || fcmtoken === "") {
    	return res.status(400).json({
            "message": "FCM Token rỗng."
        });
    }

    try {
        let checkEntity = await Entity.FCM.findOne({
        	where: {
        		username: userName,
        		key: fcmtoken
        	}
        });
        if(checkEntity ==  null || checkEntity == undefined) {
	        return res.status(400).json({
	            message: "Token không tồn tại."
	        });        	
        } else {
        	await Entity.FCM.destroy(
        	{
        		where: {
        	        		username: userName,
        	        		key: fcmtoken
        	        	}}
        	);
        	return res.status(200).json({
	            message: "Thành công"
	        }); 
        }
    }catch(e) {
    	return res.status(400).json({
            message: e.toString()
        });  
    }
});

module.exports = router;