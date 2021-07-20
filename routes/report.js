var express = require('express');
var router = express.Router();

const Entity = require('../helper/entity.helper');
const  authhelper = require("../helper/auth.helper");
const producthelper = require("../helper/product.helper");
const dateFormat = require('dateformat');

router.post('/add', async function(req, res) {
    let token = req.headers["token"];
    let id = req.body.product;
    let title = req.body.title;
    let content = req.body.content;

    if(id == null || id === "" || id === undefined) {
        return res.status(400).json({
            message: "Thiếu thông tin sản phẩm"
        });    
    }

    if(title == null || title === "" || title === undefined) {
        return res.status(400).json({
            message: "Thiếu tiêu đề"
        });    
    }

    if(content == null || content === "" || content === undefined) {
        return res.status(400).json({
            message: "Thiếu nội dung"
        });    
    }

    try {
        let product = await Entity.Product.findOne({
            where: {
                id: id
            }
        });
    
        if(product == null) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });    
        }
    
        await Entity.Report.create({
            product_id: id,
            title: title,
            content: content,
            created_at: dateFormat(Date().toLocaleString("sv", { timeZone: "Asia/Ho_Chi_Minh" }), 'yyyy-mm-dd HH:MM:ss'),
        });
    
        return res.status(200).json({
            message: "Thành công"
        });
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });  
    }
});


router.get('/list', async function(req, res) {
    let page = req.query.page;

    if(page == null) {
        page = 0;
    }

    try {
        let reports = await Entity.Report.findAll({
            limit: 10,
            offset: page * 10,
            order: [ [ 'created_at', 'DESC' ]]
        });

        let reports_count = await Entity.Report.findAll({});
    
        return res.status(200).json({
            report: reports,
            total: reports_count.length
        });
    } catch(e) {
        return res.status(400).json({
            message: e.toString()
        });  
    }
});

module.exports = router;