CREATE TABLE IF NOT EXISTS trip (
-- Trip ID.
  tripid            INT UNSIGNED
                    NOT NULL
                    AUTO_INCREMENT
                    PRIMARY KEY,

-- User's id.
  userid           INT UNSIGNED
                    NOT NULL,
  
  deviceid        VARCHAR(100),


  starttime       INT UNSIGNED,


  endtime         INT UNSIGNED,

  distance        decimal(16, 8), 

  score           decimal(16, 8),


  status          INT SIGNED

);
