const express = require('express');
const dotenv = require('dotenv').config();
const cors = require("cors");
const bodyparser = require('body-parser')
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization// =>null
    const token = authHeader && authHeader.split(' ')[1];
    if (authHeader==null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        req.payload = payload;
        next();
    });
}

function generateAccessToken(payload) {
    const data = {
        uid : payload.uid,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        tel: payload.tel,
        address: payload.address,
        room_no: payload.room_no
    };
    return jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{ expiresIn: process.env.EXP_TOKEN });
}

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
//let refreshTokens = [];
function pushRefreshToken(RToken) {
    var conn = database();
    const sql = "CALL pushToken(?);";
    conn.query(sql, [RToken], (err) => {
        if (err) {
            console.log("Error: ", err);
            conn.end();
        }
        conn.end();
    })
}
function popRefreshToken(RToken) {
    var conn = database();
    const sql = "CALL popToken(?);";
    conn.query(sql, [RToken], (err) => {
        if (err) {
            console.log("Error: ", err);
            conn.end();
        }
        conn.end();
    })
}
//Renew Access token
app.post('/token', (req, res) => {
    var conn = database();
    const sql = "CALL findToken(?);";
    const refreshToken = req.body.token;
    if (refreshToken == null) {
        return res.sendStatus(401);
    }
    else {
        conn.query(sql, [refreshToken], (err,rows) => {
            if (err) {
                console.log("Error: ", err);
                conn.end();
            } else {
                const n_token = rows[0][0].counttoken
                conn.end();
                console.log("n_token : ",n_token);
                if (n_token==0) {
                    return res.sendStatus(403);
                } else {
                    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
                        if (err) {
                            return res.sendStatus(403);
                        }else{
                            const accessToken = generateAccessToken(data);
                            console.log("Refresh token successfully!");
                            res.send({ status: 'success', data: { accessToken: accessToken} });
                        }
                    });
                }
            }
        });
    }
});
//USER Logout
app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token
    popRefreshToken(refreshToken);
    res.sendStatus(204);
});
//USER LOGIN
app.post('/login', (req, res) => {
    var conn = database();
    const email = req.body.email;
    const password = req.body.password;
    const sql = "SELECT * FROM user WHERE email=?;";
    if (email == '' || email == ' ') {
        res.status(400);
        res.send({ status: 'fail', msg: "email is emtry" });
        conn.end();
    } else {
        conn.query(sql, [email], (err, rows) => {
            if (err) {
                console.log("Error: ", err);
                res.status(400);
                res.send({ status: 'fail', msg: err });
                conn.end();
            } if (rows.length == 0) {
                res.status(404);
                res.send({ status: 'fail', msg: "Not found email!" });
                conn.end();
            }
            const OBJ = rows.map((row) => { 
                return {
                    uid : row.uid,
                    first_name: row.fname,
                    last_name: row.lname,
                    email: row.email,
                    tel: row.tel,
                    address: row.address,
                    room_no:row.room_no
                }
            });
            const hashOBJ = rows.map((row) => { 
                return {
                    password:row.password
                }
            });
            //hashOBJ[0] =>{"password":"sdfsdfsdfsdfsdfsdfsdfsfdf"}
            bcrypt.compare(password, hashOBJ[0].password, (err, result) => {
                if (result) {
                    conn.end();
                    const accessToken = generateAccessToken(OBJ[0]);
                    const refreshToken = jwt.sign(OBJ[0],process.env.REFRESH_TOKEN_SECRET);
                    console.log({ accessToken: accessToken, refreshToken: refreshToken });
                    //refreshTokens.push(refreshToken);
                    pushRefreshToken(refreshToken);
                    res.send({ status: 'success', token: { accessToken: accessToken, refreshToken: refreshToken } });
                } else {
                    conn.end(); 
                    res.status(401);
                    res.send({ status: 'fail', msg: 'login Unsuccessfully!' });
                }
            });
        });
    }
});

//CREATE USER
app.post('/user', (req, res) => {
    var conn = database();
    const uid = req.body.uid;
    const password = req.body.password;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const tel = req.body.tel;
    const address = req.body.address;
    const room_no = req.body.room_no;
    const sql = "INSERT INTO user (uid,password,fname,lname,email,address,tel,room_no) VALUES(?,?,?,?,?,?,?,?);";    
    bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS, 10), (err, hash) => {
        conn.query(sql, [uid, hash, first_name, last_name, email, address, tel, room_no], (err) => {
            if (err) {
                conn.end();
                console.log("Error: ", err);
                res.status(400);
                res.send({ status: 'fail', msg: err });
            } else {
                conn.end();
                res.status(201);
                res.send({ status: 'success', msg: 'Created user successfully!' });
            }
        });
    });
});
//DELETE USER
app.delete('/user', authenticateToken, (req, res) => {
    var conn = database();
    const uid = req.payload.uid;
    const sql = "DELETE FROM user WHERE uid=?;";
    conn.query(sql, [uid], (err) => {
        if (err) {
            conn.end();
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
        } else {
            conn.end();
            res.status(200);
            res.send({ status: 'success', msg: 'Deleted user successfully!' });
        }
    });
});
app.put('/user', authenticateToken, (req, res) => {
    var conn = database();
    const uid = req.payload.uid;
    const email = req.payload.email;
    const fname = req.body.first_name;
    const lname = req.body.last_name;
    const tel = req.body.tel;
    const address = req.body.address;
    const room_no = req.body.room_no;
    const sql = "UPDATE user SET fname=?,lname=?,tel=?,address=?,room_no=? WHERE uid=?;";
    conn.query(sql, [fname, lname, tel, address, room_no, uid], (err) => {
        if (err) {
            conn.end();
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
        } else {
            const OBJ = {
                    uid : uid,
                    first_name: fname,
                    last_name: lname,
                    email: email,
                    tel: tel,
                    address: address,
                    room_no:room_no
                    }
            conn.end();
            const accessToken = generateAccessToken(OBJ);
            const refreshToken = jwt.sign(OBJ,process.env.REFRESH_TOKEN_SECRET);
            console.log({ accessToken: accessToken, refreshToken: refreshToken });
            //refreshTokens.push(refreshToken);
            pushRefreshToken(refreshToken);
            res.send({ status: 'success', token: { accessToken: accessToken, refreshToken: refreshToken } });
        }
    });
});

app.listen(process.env.AUTH_SERVER_PORT, process.env.HOST, () => {
    console.log(`🔥🔥🔥 AUTH SERVER RUNNING 🚀🚀 http://${process.env.HOST}:${process.env.AUTH_SERVER_PORT}`);
});