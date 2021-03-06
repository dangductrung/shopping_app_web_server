var express = require('express');
var router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.get('/info', async function(req,res) {
	let token = req.headers["token"];
    try {
    	let username = await authhelper.getUserName(token);
	    let result = await Entity.Profile.findOne({
	    	attributes: ["username", "email", "phone", "name", "point"],
	    	where: {
	    		username: username
	    	}
	    });
    	return res.status(200).json(result); 
    } catch(e) {
    	return res.status(400).json({
            message: e.toString()
        });
    }
});

router.post('/update', async function(req,res) {
	let token = req.headers["token"];
    try {
    	let username = await authhelper.getUserName(token);

    	let name = req.body.name;
    	let email = req.body.email;
    	let phone = req.body.phone;


	    let result = await Entity.Profile.findOne({
	    	where: {
	    		username: username
	    	}
	    });

	    if(name !== undefined && name !== null) {
	    	result.name = name;
	    }

	    if(email !== undefined && email !== null) {
	    	result.email = email;
	    }

	    if(phone !== undefined && phone !== null) {
	    	result.phone = phone;
	    }

	    result.save();

    	return res.status(200).json(result); 
    } catch(e) {
    	return res.status(400).json({
            message: e.toString()
        });
    }
});

router.post('/changepw', async function(req,res) {
	let token = req.headers["token"];
    try {
    	let username = await authhelper.getUserName(token);

    	let oldPw = req.body.oldPw;
    	let newPw = req.body.newPw;

    	if(newPw.length < 8) {
    		return res.status(404).json({
                "message": "Mật khẩu mới phải ít nhất 8 kí tự"
            });
    	}

        const user = await Entity.User.findOne({
            where: {
                username: username
            }
        });

        if(oldPw === newPw) {
        	return res.status(404).json({
                "message": "Mật khẩu mới trùng với mật khẩu cũ"
            });
        }

        if(user == null) {
            return res.status(404).json({
                "message": "Tên đăng nhập không tồn tại"
            });
        }    	

    	const isValidate = bcrypt.compareSync(oldPw, user.password);
        if(!isValidate) {
            return res.status(400).json({
                "message": "Mật khẩu không đúng"
            });
        }


	    let result = await Entity.User.findOne({
	    	where: {
	    		username: username
	    	}
	    });

		const salt = bcrypt.genSaltSync(parseInt(process.env.SALT));
	    const hash = bcrypt.hashSync(newPw, salt);

	    result.password = hash;
	    result.save();

    	return res.status(200).json({
	        message: "Thành công"
	    });      
    } catch(e) {
    	return res.status(400).json({
            message: e.toString()
        });
    }
});


module.exports = router;