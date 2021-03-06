const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var User = sequilize.define('users', {
    username: {
        primaryKey: true,
        type: DataTypes.STRING(255)},
    password: DataTypes.STRING(300),
    is_admin: DataTypes.BOOLEAN
},  {timestamps: false,});


module.exports = User;