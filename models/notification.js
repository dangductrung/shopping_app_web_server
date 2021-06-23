const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Notification = sequilize.define('notifications', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    type: DataTypes.STRING(10),
    body: DataTypes.STRING(1000),
    title: DataTypes.STRING(1000),
    created_at: DataTypes.DATE,
    username: DataTypes.STRING(255),
    is_read: DataTypes.BOOLEAN
},  {timestamps: false,});


module.exports = Notification;