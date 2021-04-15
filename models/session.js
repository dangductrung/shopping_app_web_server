const sequilize = require("../ultils/serialize.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Session = sequilize.define('sessions', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    username: DataTypes.STRING(255),
    access_token: DataTypes.STRING(300),
    expired_at: DataTypes.STRING(50)
},  {timestamps: false,});


module.exports = Session;