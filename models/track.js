const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Track = sequilize.define('tracks', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    username: DataTypes.STRING(255),
    frequency: DataTypes.INTEGER,
    match_id: DataTypes.INTEGER
},  {timestamps: false,});


module.exports = Track;