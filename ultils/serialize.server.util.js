var seq = require('sequelize');

var sequelize = new seq('web_server', 'root', 'ductrung@@113', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 100,
        min: 0,
        idle: 10000
    },
});

module.exports = sequelize;