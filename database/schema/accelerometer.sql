CREATE TABLE `accelerometer_trace` (
  `tripid` int(10) UNSIGNED NOT NULL,
  `time` bigint(20) UNSIGNED NOT NULL,
  `x` float NOT NULL,
  `y` float NOT NULL,
  `z` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `accelerometer_trace`
  ADD PRIMARY KEY (`tripid`,`time`);
