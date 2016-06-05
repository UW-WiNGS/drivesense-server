CREATE TABLE IF NOT EXISTS user (
-- User ID.
  userid            INT UNSIGNED
                    NOT NULL
                    AUTO_INCREMENT
                    PRIMARY KEY,

-- User's email address.
  email         VARCHAR(100)
                    NOT NULL
                    UNIQUE,

-- The hash of user's password.
  password   VARCHAR(100), 

-- User first name
  firstname    VARCHAR(100),  

-- User last name

  lastname    VARCHAR(100)

);
