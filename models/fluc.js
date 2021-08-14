const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Fluc = sequilize.define('flucs', {
    id: {
        type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
    } ,
    from: DataTypes.STRING(45),
    count: DataTypes.INTEGER,
    time: DataTypes.STRING(50)
},  {timestamps: false,});


module.exports = Fluc;