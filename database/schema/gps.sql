CREATE TABLE `gps_trace` (
  `tripid` int(10) UNSIGNED NOT NULL,
  `time` bigint(20) UNSIGNED NOT NULL,
  `lat` decimal(16,8) NOT NULL,
  `lng` decimal(16,8) NOT NULL,
  `alt` decimal(16,8) NOT NULL,
  `speed` decimal(16,8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `gps_trace`
  ADD PRIMARY KEY (`tripid`,`time`) USING BTREE;