CREATE TABLE `trip` (
  `tripid` int(10) UNSIGNED NOT NULL,
  `guid` varchar(36) NOT NULL,
  `userid` int(10) UNSIGNED NOT NULL,
  `deviceid` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `distance` decimal(16,8) DEFAULT NULL,
  `status` int(11) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `trip`
  ADD PRIMARY KEY (`tripid`),
  ADD UNIQUE KEY `guid` (`userid`,`guid`) USING BTREE;


ALTER TABLE `trip`
  MODIFY `tripid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;