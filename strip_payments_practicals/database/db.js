

const sqlite3 = require('sqlite3').verbose();
const { promises, resolve } = require('dns');
const fs = require('fs');
const path = require('path');
 
const db = new sqlite3.Database(
    path.join(__dirname, 'practical.db')
);
const schema = fs.readFileSync(path.join(__dirname, ' schema.sql'), 'utf-8');
db.exec(schema , (err)=>{
    if(err) console.error('schema setup error! ', err);
});

// check the demo user -->
db.get(
    'SELECT  *  FROM users WHERE username =?',['student'],(err, row )=>{
        if (!row) {
            db.run ('INSERT INTO users (username ,  password) VALUES(?,?) ', ['student', 'college123']);
        }
});

// create the function  to callback the api-->
function run(sql, params = []) {
    return  new Promise((resolve,reject )=>{
        db.run(sql, params,function(err) {
            if (err) reject (err); else  resolve(this);
        });
    });

}


function get(sql ,params = []) {
    return  new  Promise((resolve, reject)=>{
        db.get(sql ,params ,function (err) {
            if (err)  reject  (err); else resolve(row);
        });
    });
}

function all(sql ,params = []) {
    return new Promise((reject, resolve) =>{
        db.all(sql, params, function (err) {
            if (err) reject (err); else resolve(row);
        });
    });

}

module.exports = {db , run ,get  ,all };