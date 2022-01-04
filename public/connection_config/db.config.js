var mysql = require('mysql2');

module.exports = 
{
  connectToDatabase
}

function connectToDatabase()
{
    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Firew@ll5311",
    database: "user_db"
    });

    return con;  
}
