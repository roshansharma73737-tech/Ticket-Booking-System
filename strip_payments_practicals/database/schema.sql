CREATE TABLE IF NOT EXISTS users (
    id INTEGER  PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT  NULL ,
    password TEXT NOT NULL 
);
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL,
    amount REAL NOT NULL,
    country TEXT NOT NULL,
    currency TEXT NOT NULL,
    method  TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reference_id TEXT ,
    created _at DATETIME DEFAULT  CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
