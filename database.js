import mysql from "mysql2";

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_login_system",
});

export default connection.promise();
