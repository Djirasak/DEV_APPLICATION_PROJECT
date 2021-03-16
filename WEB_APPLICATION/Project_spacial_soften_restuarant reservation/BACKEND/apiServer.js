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
app.get('/', (req, res) => {
    var conn = database();
    conn.connect((err) => {
        if (err) {
            res.send({status:"fail",msg:err});
            conn.end();
        }
        res.send({ status: "ok", msg: "Connected database successfully!" });
        conn.end();
    });
});
app.get('/restaurant', (req, res) => {
    var conn = database();
    const sql = "SELECT * FROM restaurant;";
    conn.query(sql, (err, rows) => {
        if (err) {
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
            conn.end();
        } else {
            const OBJ = rows.map((row) => {
                return {
                    rid: row.rid,
                    restaurant_name: row.name,
                    address: row.address,
                    description: row.description
                }
            });
            //OBJ=[{},{},{},{},{},{}]
            conn.end();
            res.send({ status:"success",data:OBJ});
        }
    });
});
app.get('/restaurant/:rid',authenticateToken, (req, res) => {
    var conn = database();
    const rid = req.params.rid;
    const sql = "SELECT * FROM restaurant WHERE rid=?;";
    conn.query(sql,[rid], (err, rows) => {
        if (err) {
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
            conn.end();
        } else {
            const OBJ = rows.map((row) => {
                return {
                    rid : row.rid,
                    first_name: row.fname,
                    last_name: row.lname,
                    restaurant_name: row.name,
                    email: row.email,
                    tel: row.tel,
                    address: row.address,
                    description: row.description,
                    minperq: row.minperq,
                    maxperq: row.maxperq,
                    qperday: row.qperday
                }
            });
            //OBJ=[{},{},{},{},{},{}]
            conn.end();
            res.send({ status:"success",data:OBJ[0]});
        }
    });
});
app.get('/user', authenticateToken,(req, res) => {
    var conn = database();
    const uid = req.data.uid;
    const sql = "SELECT * FROM user WHERE uid=?;";
    conn.query(sql,[uid], (err, rows) => {
        if (err) {
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
            conn.end();
        } else {
            const OBJ = rows.map((row) => {
                return {
                     uid : row.uid,
                    first_name: row.fname,
                    last_name: row.lname,
                    email: row.email,
                    tel : row.tel
                }
            });
            //OBJ=[{},{},{},{},{},{}]
            conn.end();
            res.send({ status:"success",data:OBJ[0]});
        }
    });
});
app.listen(process.env.API_SERVER_PORT, process.env.HOST, () => {
    console.log(`🚀🚀🚀 AUTH SERVER RUNNING 🔥🔥🔥 http://${process.env.HOST}:${process.env.API_SERVER_PORT}`);
});