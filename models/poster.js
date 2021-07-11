const sequilize = require("../ultils/serialize.server.util");
const { Sequelize, Model, DataTypes } = require('sequelize');


var Poster = sequilize.define('posters', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    title: DataTypes.STRING(255),
    bg_color_start: DataTypes.STRING(255),
    bg_color_end: DataTypes.STRING(255),
    txt_color: DataTypes.STRING(255),
},  {timestamps: false,});


module.exports = Poster;