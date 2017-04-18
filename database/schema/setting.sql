CREATE TABLE `setting` (
  `id` int(11) NOT NULL,
  `userid` int(10) UNSIGNED NOT NULL,
  `name` varchar(250) NOT NULL,
  `value` varchar(4000) NOT NULL COMMENT 'JSON value of the setting'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `setting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userid` (`userid`,`name`);


ALTER TABLE `setting`
  ADD CONSTRAINT `setting_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`userid`) ON DELETE CASCADE ON UPDATE CASCADE;