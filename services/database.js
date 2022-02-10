const { Pool } = require('pg');

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.IS_LOCAL ? undefined : { rejectUnauthorized: false },
});

function getTweets() {
  return database.query(`
    SELECT
      tweets.id,
      tweets.message,
      tweets.created_at,
      users.name,
      users.username
    FROM
      tweets
    INNER JOIN users ON
      tweets.user_id = users.id
    ORDER BY created_at DESC;
  `)
    .then((results) => results.rows);
}

function getTweetsByUsername(username) {
  return database.query(`
    SELECT
      tweets.id,
      tweets.message,
      tweets.created_at,
      users.name,
      users.username
    FROM
      tweets
    INNER JOIN users ON
      tweets.user_id = users.id
    WHERE
      users.username = $1
    ORDER BY created_at DESC;
  `, [username])
    .then((results) => results.rows);
}

function createTweet(message, user_id) {
  return database.query(`
    INSERT INTO tweets
      (message, user_id)
    VALUES
      ($1, $2)
    RETURNING
      *
  `, [
    message,
    user_id
  ])
    .then((results) => results.rows[0]);
}

function createUser(name, username, password) {
  return database.query(`
    INSERT INTO users
      (name, username, password)
    VALUES
      ($1, $2, $3)
    RETURNING
      *
  `, [
    name,
    username || null,
    password
  ])
    .then((results) => results.rows[0]);
}

function getUserByUsername(username) {
  return database.query(`
    SELECT * FROM users WHERE username = $1
  `, [username])
    .then((results) => results.rows[0]);
}

module.exports = {
  getTweets,
  createTweet,
  getUserByUsername,
  createUser,
  getTweetsByUsername,
};