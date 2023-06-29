const fs = require('fs');
var mysql = require('mysql');

const sqlAuth = JSON.parse(fs.readFileSync(__dirname + '/../auth/sqlAuth.json').toString());

var con = mysql.createConnection(sqlAuth);

con.connect(function(err) {
    if (err) {
        console.log("MySQL connection error!");
        throw err;
    }
    console.log("MySQL successfully connected");
});

module.exports = con;