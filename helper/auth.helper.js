const User = require('../models/user');
const Session = require('../models/session');
const moment = require('moment');
const dateFormat = require('dateformat');

const isAuth = async (token) => {
    try {
        let session = await Session.findOne({
            where: {
                access_token: token
            }
        });
    
        let expired_at = moment(session.expired_at, 'YYYY-MM-DD HH:mm:ss').format();
        let current_date = moment( dateFormat(Date().toLocaleString("sv", { timeZone: "Asia/Ho_Chi_Minh" }), 'yyyy-mm-dd HH:MM:ss'), 'YYYY-MM-DD HH:mm:ss').format();
    
        if(session != null) {
            return current_date < expired_at;
        }
        return false;
    } catch(e) {
        return false;
    }
    
}

const getUserName = async (token) =>  {
    try {
        if(!(await isAuth(token))) {
            return null;
        }
    
        let session = await Session.findOne({
            where: {
                access_token: token
            }
        });
        return session.username;
    }catch(e) {
        return null;
    }
    
}

module.exports = {isAuth, getUserName}