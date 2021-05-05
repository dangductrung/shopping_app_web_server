var express = require('express');
var router = express.Router();

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dateFormat = require('dateformat');

const Entity = require('../helper/entity.helper');

router.post("/register", async function(req, res)  {
    let username = req.body.username;
    let pw = req.body.password;

    if(username === "" || username == undefined || pw === "" || pw == undefined) {
        return res.status(400).json({"message" : "username and password is required"});
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT));
    const hash = bcrypt.hashSync(pw, salt);

    try {
        const user = await Entity.User.create({
            username: username,
            password: hash
        });
    
        const token = crypto.randomBytes(16).toString("hex");
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + parseInt(process.env.EXPIRE))
    
        const session = await Entity.Session.create({
            username: user.username,
            access_token: token,
            expired_at: dateFormat(expiredDate.toLocaleString("sv", { timeZone: "Asia/Ho_Chi_Minh" }), 'yyyy-mm-dd HH:MM:ss')
        });
        return res.status(200).json({
            "access_token": session.access_token,
            "expired_at": session.expired_at
        });
    }catch(e) {
        return res.status(400).json({
            "message": "Username already exists"
        });
    }
});

router.post("/login", async function(req, res) {
    let username = req.body.username;
    let pw = req.body.password;

    if(username === "" || username == undefined || pw === "" || pw == undefined) {
        return res.status(400).json({"message" : "username and password is required"});
    }

    try {
        const user = await Entity.User.findOne({
            where: {
                username: username
            }
        });

        if(user == null) {
            return res.status(404).json({
                "message": "Username or password not found"
            });
        }

        const isValidate = bcrypt.compareSync(pw, user.password);
        if(!isValidate) {
            return res.status(400).json({
                "message": "Password is incorrect"
            });
        }

        const token = crypto.randomBytes(16).toString("hex");
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + parseInt(process.env.EXPIRE))
    
        const session = await Entity.Session.create({
            username: user.username,
            access_token: token,
            expired_at: dateFormat(expiredDate.toLocaleString("sv", { timeZone: "Asia/Ho_Chi_Minh" }), 'yyyy-mm-dd HH:MM:ss')
        });
        return res.status(200).json({
            "access_token": session.access_token,
            "expired_at": session.expired_at
        });

    }catch(e) {
        return res.status(404).json({
            "message": "Username or password not found"
        });
    }
});

module.exports = router;
