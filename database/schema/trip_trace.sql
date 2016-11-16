CREATE TABLE `trip_trace` (
  `tripid` int(10) UNSIGNED NOT NULL,
  `time` bigint(20) UNSIGNED NOT NULL,
  `score` float NOT NULL,
  `tilt` float NOT NULL,
  `brake` float NOT NULL,
  `lat` decimal(16,8) NOT NULL,
  `lng` decimal(16,8) NOT NULL,
  `alt` float NOT NULL,
  `speed` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `trip_trace`
  ADD PRIMARY KEY (`tripid`,`time`);
