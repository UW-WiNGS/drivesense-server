CREATE TABLE IF NOT EXISTS gps (
-- Trip ID.
  tripid            INT UNSIGNED
                    NOT NULL,

  time           INT UNSIGNED
                    NOT NULL,

  lat           decimal(16, 8)
                   NOT NULL,

  lng          decimal(16, 8)
                 NOT NULL,

  alt          decimal(16, 8)
                 NOT NULL,

  speed         decimal(16, 8)
                  NOT NULL,

  score         decimal(16, 8)
                  NOT NULL,


  event         INT SIGNED
);
