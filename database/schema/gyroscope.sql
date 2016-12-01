CREATE TABLE `gyroscope_trace` (
  `tripid` int(10) UNSIGNED NOT NULL,
  `time` bigint(20) UNSIGNED NOT NULL,
  `x` float NOT NULL,
  `y` float NOT NULL,
  `z` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `gyroscope_trace`
  ADD UNIQUE KEY `tripid` (`tripid`,`time`);