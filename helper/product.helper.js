const followhelper = require('./follow.helper');

const genPrd = async (prd, token) => {
    return obj = {
        id: prd.id,
        name: prd.name,
        image: prd.image,
        brand: prd.brand,
        from: prd.from,
        link: prd.link,
        created_at: prd.created_at,
        current_price: prd.current_price,
        isFollow: await followhelper.isFollow(prd.link, token)
    };
}


module.exports = {genPrd}