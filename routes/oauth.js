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
        return res.status(400).json({"message" : "Tên đăng nhập và mật khẩu là bắt buộc"});
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT));
    const hash = bcrypt.hashSync(pw, salt);

    try {
        username = username.split(' ').join('');
        pw = pw.split(' ').join('');
        
        const isExist = await Entity.User.findOne({
            where: {
                username: username
            }
        });

        if(isExist != null || isExist != undefined) {
            return res.status(400).json({"message" : "Tên đăng nhập đã tồn tại"});
        }

        const user = await Entity.User.create({
            username: username,
            password: hash
        });

        const profile = await Entity.Profile.create({
            username: username,
            email: "",
            phone: "",
            name: "",
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
            "message": e.toString()
        });
    }
});

router.post("/login", async function(req, res) {
    let username = req.body.username;
    let pw = req.body.password;

    if(username === "" || username == undefined || pw === "" || pw == undefined) {
        return res.status(400).json({"message" : "Tên đăng nhập và mật khẩu là bắt buộc"});
    }

    try {
        username = username.split(' ').join('');
        pw = pw.split(' ').join('');
        
        const user = await Entity.User.findOne({
            where: {
                username: username,
                is_admin: false
            }
        });

        if(user == null) {
            return res.status(404).json({
                "message": "Tên đăng nhập hoặc mật khẩu không tồn tại"
            });
        }

        const isValidate = bcrypt.compareSync(pw, user.password);
        if(!isValidate) {
            return res.status(400).json({
                "message": "Mật khẩu không đúng"
            });
        }

        const token = crypto.randomBytes(16).toString("hex");
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + parseInt(process.env.EXPIRE))

        await Entity.Session.destroy({
            where: {
                username: username
            }
        });
    
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
            "message": "Tên đăng nhập không tồn tại"
        });
    }
});

router.post("/login/admin", async function(req, res) {
    let username = req.body.username;
    let pw = req.body.password;

    if(username === "" || username == undefined || pw === "" || pw == undefined) {
        return res.status(400).json({"message" : "Tên đăng nhập và mật khẩu là bắt buộc"});
    }

    try {
        const user = await Entity.User.findOne({
            where: {
                username: username,
                is_admin: true
            }
        });

        if(user == null) {
            return res.status(404).json({
                "message": "Tên đăng nhập hoặc mật khẩu không tồn tại"
            });
        }

        const isValidate = bcrypt.compareSync(pw, user.password);
        if(!isValidate) {
            return res.status(400).json({
                "message": "Mật khẩu không đúng"
            });
        }

        const token = crypto.randomBytes(16).toString("hex");
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + parseInt(process.env.EXPIRE))

        await Entity.Session.destroy({
            where: {
                username: username
            }
        });
    
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
            "message": "Tên đăng nhập không tồn tại"
        });
    }
});

module.exports = router;
