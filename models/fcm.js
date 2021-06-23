const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var FCM = sequilize.define('fcms', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    username: DataTypes.STRING(255),
    key: DataTypes.STRING(1500)
},  {timestamps: false,});


module.exports = FCM;