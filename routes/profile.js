var express = require('express');
var router = express.Router();

const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");

router.get('/info', async function(req,res) {
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

module.exports = router;