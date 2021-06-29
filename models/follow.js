const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Follow = sequilize.define('follows', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    username: DataTypes.STRING(255),
    link: DataTypes.STRING(1500),
    current_price: DataTypes.FLOAT,
    is_new: DataTypes.BOOLEAN
},  {timestamps: false,});


module.exports = Follow;