CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT
);

CREATE TABLE tweets (
  ID SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id INT NOT NULL REFERENCES users (ID),
  message VARCHAR(255)
);

INSERT INTO users (name, username, password)
  VALUES
    ('Santa', 'santaclaus', '1234'),
    ('Donald', 'trump', '4321');

INSERT INTO tweets (user_id, message)
  VALUES
    (1, 'Hohoho! Merry Christmas!'),
    (1, '#fakenews'),
    (2, 'Did I win?');