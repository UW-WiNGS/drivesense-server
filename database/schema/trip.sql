CREATE TABLE `trip` (
  `tripid` int(10) UNSIGNED NOT NULL,
  `userid` int(10) UNSIGNED NOT NULL,
  `deviceid` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `starttime` bigint(20) UNSIGNED DEFAULT NULL,
  `endtime` bigint(20) UNSIGNED DEFAULT NULL,
  `distance` decimal(16,8) DEFAULT NULL,
  `score` decimal(16,8) DEFAULT NULL,
  `tripstatus` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `trip`
  ADD PRIMARY KEY (`tripid`),
  ADD UNIQUE KEY `trip_stime` (`deviceid`,`starttime`);

ALTER TABLE `trip`
  MODIFY `tripid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;