const express = require('express');
const dotenv = require('dotenv').config();
const cors = require("cors");
const bodyparser = require('body-parser')
const mysql = require('mysql');

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
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,\
                                                DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, \
            Content-Type, Accept, x-client-key, x-client-token, x-client-secret,\
             Authorization");
    next();
});

app.get('/', (req, res) => {
    var conn = database();
    conn.connect((err)=>{
        if (err) {
            res.send({status:"fail",msg:err});
            conn.end();
        } else {
            res.status(200);
            res.send({status:"success",msg:"Connected database successfully!"});
            conn.end();
        }
    });
});



app.listen(process.env.AUTH_SERVER_PORT, process.env.HOST, () => {
    console.log(`🔥🔥🔥 AUTH SERVER RUNNING 🚀🚀 http://${process.env.HOST}:${process.env.AUTH_SERVER_PORT}`);
});