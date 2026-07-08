-- M1: set documented dev password for the seed user (username: admin, password: admin).
UPDATE users
SET password_hash = '$2a$12$eCaYBhh3erpmOg3uQ21eeOG0/GE4QGxS4OC1gTD5OHf0DL9IYLXb.'
WHERE username = 'admin';
