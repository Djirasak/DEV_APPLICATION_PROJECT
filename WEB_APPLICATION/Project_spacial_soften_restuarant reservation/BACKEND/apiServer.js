const express = require("express");
const dotenv = require("dotenv").config();
var bodyparser = require('body-parser')
const cors = require("cors");
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const jwt = require("jsonwebtoken");

function database(){
    return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DBNAME,
    charset: process.env.DB_CHARSET,
  });
}
const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use((req, res, next) => {
    //enable CORS middleware
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization")
    next();
});
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]
    if (token==null) {
        return res.sendStatus(401);
    } 
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
         if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        req.data = data
        console.log(req.data);
        next();
    });
    
}
app.listen(process.env.API_SERVER_PORT, process.env.HOST, () => {
    console.log(`🚀🚀🚀 AUTH SERVER RUNNING 🔥🔥🔥 http://${process.env.HOST}:${process.env.API_SERVER_PORT}`);
});