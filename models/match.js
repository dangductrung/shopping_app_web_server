const sequilize = require("../ultils/serialize.product.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Match = sequilize.define('matches', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    product_id: DataTypes.INTEGER,
    name: DataTypes.STRING(500) ,
},  {
    charset: 'utf8mb4',
    timestamps: false,
});


module.exports = Match;