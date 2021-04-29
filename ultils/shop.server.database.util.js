const mysql = require('mysql');
const util = require('util');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'ductrung@@113',
    database: 'shopping',
    insecureAuth: true
});

const pool_query = util.promisify(pool.query).bind(pool);

module.exports = {
    // query: async(sql) => pool_query(sql).then(value => {console.log(value); return value[0]}),
    query: (sql) => {return pool_query(sql);}
};