const sequilize = require("../ultils/serialize.product.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Product = sequilize.define('products', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    name: DataTypes.STRING(300),
    brand: DataTypes.STRING(255),
    from: DataTypes.STRING(25),
    link: DataTypes.STRING(255) ,
    match_id: DataTypes.INTEGER ,
    created_at: DataTypes.DATE ,
    current_price: DataTypes.FLOAT
},  {
    charset: 'utf8mb4',
    timestamps: false,
});


module.exports = Product;