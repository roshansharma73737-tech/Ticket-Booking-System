const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'practical.db'));

// Run schema.sql once on startup (creates tables if they don't exist)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema, (err) => {
  if (err) console.error('Schema setup error:', err);
});

// Seed one demo user so the practical works out of the box
db.get('SELECT * FROM users WHERE username = ?', ['student'], (err, row) => {
  if (!row) {
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['student', 'college123']);
  }
});

// Promise-friendly wrappers around sqlite3's callback API
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve(this); // this.lastID, this.changes
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}

module.exports = { db, run, get, all };
