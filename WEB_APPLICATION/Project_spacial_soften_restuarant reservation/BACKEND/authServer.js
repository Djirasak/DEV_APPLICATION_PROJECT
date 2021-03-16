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
function generateAccessToken(payload) {
    const data = {
        uid : payload.uid,
        first_name: payload.first_name,
        last_name: payload.last_name,
        Email: payload.email,
        tel : payload.tel
    };
    return jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.EXP_TOKEN});
}
function generateAccessTokenRes(payload) {
    const data = {
        rid : payload.rid,
        first_name: payload.fname,
        last_name: payload.lname,
        restaurant_name: payload.name,
        email: payload.email,
        tel: payload.tel,
        address: payload.address,
        description: payload.description,
        minperq: payload.minperq,
        maxperq: payload.maxperq,
        qperday: payload.qperday
    };
    return jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.EXP_TOKEN});
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
//let refreshTokens = [];
function pushToken(RToken) {
    var conn = database();
    const sql = "CALL pushToken(?);";
    conn.query(sql, [RToken], (err) => {
        if (err) {
            console.log("Error: ", err);
            conn.end();
        }
        conn.end();
    });
}
function popToken(RToken) {
    var conn = database();
    const sql = "CALL popToken(?);";
    conn.query(sql, [RToken], (err) => {
        if (err) {
            console.log("Error: ", err);
            conn.end();
        }
        conn.end();
    });
}
app.post('/user/token', (req, res) => {
    var conn = database();
    const sql = "CALL findToken(?);";
    const refreshToken = req.body.token;
    if (refreshToken==null) {
        return res.sendStatus(401);
    }
    else {
        conn.query(sql, [refreshToken], (err, rows) => {
            if (err) {
                console.log("Error: ", err);
                conn.end();
            } else {
                const nToken = rows[0][0].numToken;
                conn.end();
                console.log("n_token : ", n_token);
                if (nToken==0) {
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
//USER AUTHENTICATION
app.post('/user/login/', (req, res) => { 
    var conn = database();
    const email = req.body.email;
    const password = req.body.password;
    const query = "SELECT * FROM user WHERE email=?;";
    if (email == '' || email == ' ') {
        res.status(400);
        res.send({ status: 'fail', msg: "email is emtry" });
        conn.end();
    } else {
    conn.query(query, [email], (err, rows) => {
        if (err) {
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
            conn.end();
        }
        if (rows.length == 0) {
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
                    tel : row.tel
                }
        });
        const hashOBJ = rows.map((row) => { 
                return {
                    password:row.hashpassword
                }
        });
        //hashOBJ =>[{"password":"sdfsdfsdfsdfsdfsdfsdfsfdf"}]
        bcrypt.compare(password, hashOBJ[0].password, (err,result) => {
            console.log(result)
            if (result) {
                conn.end();
                const accessToken = generateAccessToken(OBJ[0]);
                const refreshToken = jwt.sign(OBJ[0], process.env.REFRESH_TOKEN_SECRET);
                console.log({ accessToken: accessToken, refreshToken: refreshToken });
                //refreshTokens.push(refreshToken);
                pushToken(refreshToken);
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
//Logout
app.delete('/user/logout', (req, res) => { 
    //refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    //console.log(refreshTokens);
    const Rtoken = req.body.token;
    popToken(Rtoken);
    res.sendStatus(204);
});
//Create User
app.post('/user', (req, res) => {
    var conn = database();
    const uid = req.body.uid;
    const fname = req.body.first_name;
    const lname = req.body.last_name;
    const tel = req.body.tel;
    const email = req.body.email;
    const password = req.body.password;
    const query = "INSERT INTO user \
                        (uid,fname,lname,email,hashpassword,tel) \
                        VALUES(?,?,?,?,?,?);";
    bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS, 10), (err, hash) => { 
        conn.query(query, [uid, fname, lname, email, hash, tel], (err, rows) => { 
            if (err) {
                console.log("Error: ", err);
                conn.end();
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
//Delete User
app.delete('/user', authenticateToken, (req, res) => {
    var conn = database();
    const uid = req.data.uid
    const query = "DELETE FROM user WHERE uid=?;";
    conn.query(query, [uid], (err) => {
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
//Update User
app.put('/user', authenticateToken, (req, res) => {
    var conn = database();
    const uid = req.data.uid;
    const fname = req.body.first_name;
    const lname = req.body.last_name;
    const tel = req.body.tel;
    const query = "UPDATE user SET fname=?,lname=?,tel=? WHERE uid=?;";
    const query2 = "SELECT * FROM user WHERE uid=?;";
    conn.query(query, [fname, lname, tel, uid], (err) => {
        if (err) {
            conn.end();
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
        } else {
            conn.query(query2, [uid], (err, rows) => {
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
                                        Email: row.email,
                                        tel : row.tel
                                    }
                                });
                    const accessToken = generateAccessToken(OBJ[0]);
                    const refreshToken = jwt.sign(OBJ[0], process.env.REFRESH_TOKEN_SECRET);
                    pushToken(refreshToken);
                    res.send({ status: 'success', data: { accessToken: accessToken,refreshToken:refreshToken } });
                    conn.end();
                }
            });
        }
    });
});

//Create Restaurant
app.post('/restaurant', (req, res) => {
    var conn = database();
    const rid = req.body.rid;
    const fname = req.body.first_name;
    const lname = req.body.last_name;
    const name = req.body.restaurant_name;
    const tel = req.body.tel;
    const address = req.body.address;
    const description = req.body.description;
    const minperq = req.body.minperq;
    const maxperq = req.body.maxperq;
    const qperday = req.body.qperday;
    const email = req.body.email;
    const password = req.body.password;
    const query = "CALL setRES(?,?,?,?,?,?,?,?,?,?,?,?);";
    bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS, 10), (err, hash) => { 
        conn.query(query, [rid,fname,lname,name,address,tel,email,description,minperq,maxperq,qperday,hash], (err, rows) => { 
            if (err) {
                console.log("Error: ", err);
                conn.end();
                res.status(400);
                res.send({ status: 'fail', msg: err });
            } else {
                conn.end();
                res.status(201);
                res.send({ status: 'success', msg: 'Created restaurant successfully!' });
            }
        });
    });
});
//restaurant AUTHENTICATION
app.post('/restaurant/login/', (req, res) => { 
    var conn = database();
    const email = req.body.email;
    const password = req.body.password;
    const query = "SELECT * FROM restaurant WHERE email=?;";
    if (email == '' || email == ' ') {
        res.status(400);
        res.send({ status: 'fail', msg: "email is emtry" });
        conn.end();
    } else {
    conn.query(query, [email], (err, rows) => {
        if (err) {
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
            conn.end();
        }
        if (rows.length == 0) {
            res.status(404);
            res.send({ status: 'fail', msg: "Not found email!" });
            conn.end();
        }
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
        const hashOBJ = rows.map((row) => { 
                return {
                    password:row.hashpassword
                }
        });
        //hashOBJ =>[{"password":"sdfsdfsdfsdfsdfsdfsdfsfdf"}]
        bcrypt.compare(password, hashOBJ[0].password, (err,result) => {
            console.log(result)
            if (result) {
                conn.end();
                const accessToken = generateAccessTokenRes(OBJ[0]);
                const refreshToken = jwt.sign(OBJ[0], process.env.REFRESH_TOKEN_SECRET);
                console.log({ accessToken: accessToken, refreshToken: refreshToken });
                //refreshTokens.push(refreshToken);
                pushToken(refreshToken);
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
//Logout
app.delete('/restaurant/logout', (req, res) => { 
    //refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    //console.log(refreshTokens);
    const Rtoken = req.body.token;
    popToken(Rtoken);
    res.sendStatus(204);
});
//Delete restaurant
app.delete('/restaurant', authenticateToken, (req, res) => {
    var conn = database();
    const rid = req.data.rid
    const query = "DELETE FROM restaurant WHERE rid=?;";
    conn.query(query, [rid], (err) => {
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
//Update restaurant
app.put('/restaurant', authenticateToken, (req, res) => {
    var conn = database();
    const rid = req.data.rid;
    const fname = req.body.first_name;
    const lname = req.body.last_name;
    const name = req.body.restaurant_name;
    const tel = req.body.tel;
    const address = req.body.address;
    const description = req.body.description;
    const minperq = req.body.minperq;
    const maxperq = req.body.maxperq;
    const qperday = req.body.qperday;
    const query = "CALL updateRES(?,?,?,?,?,?,?,?,?,?);";
    const query2 = "SELECT * FROM restaurant WHERE rid=?;";
    conn.query(query, [rid,fname,lname,name,address,tel,description,minperq,maxperq,qperday], (err) => {
        if (err) {
            conn.end();
            console.log("Error: ", err);
            res.status(400);
            res.send({ status: 'fail', msg: err });
        } else {
            conn.query(query2, [rid], (err, rows) => {
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
                    const accessToken = generateAccessTokenRes(OBJ[0]);
                    const refreshToken = jwt.sign(OBJ[0], process.env.REFRESH_TOKEN_SECRET);
                    pushToken(refreshToken);
                    res.send({ status: 'success', data: { accessToken: accessToken,refreshToken:refreshToken } });
                    conn.end();
                }
            });
        }
    });
});
app.listen(process.env.AUTH_SERVER_PORT, process.env.HOST, () => {
    console.log(`AUTH SERVER RUNNING AT http://${process.env.HOST}:${process.env.AUTH_SERVER_PORT}`);
});