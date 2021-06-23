const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Report = sequilize.define('reports', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    title: DataTypes.STRING(255),
    content: DataTypes.STRING(1500)
},  {timestamps: false,});


module.exports = Report;