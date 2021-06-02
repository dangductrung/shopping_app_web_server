const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Profile = sequilize.define('profiles', {
    username: {
        primaryKey: true,
        type: DataTypes.STRING(255),
    },
    email: DataTypes.STRING(100),
    phone: DataTypes.STRING(20),
    name: DataTypes.STRING(255),
    point: DataTypes.INTEGER,
},  {timestamps: false,});


module.exports = Profile;