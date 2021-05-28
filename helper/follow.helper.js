const Entity = require('../helper/entity.helper');
const authhelper = require("../helper/auth.helper");

const isFollow = async (link, token) => {
    let username = await authhelper.getUserName(token);
    try {
        let follow = await Entity.Follow.findOne({
            where: {
                username: username,
                link: link
            }
        });
    
        if(follow == null || follow == undefined) {
            return false;
        }
    
        return true;
    } catch(e) {
        return false;
    }
}

module.exports = {isFollow}