#!/bin/bash

sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to 8000
sudo cp ./drivesense.conf /etc/init/drivesense.conf

sudo vim /lib/systemd/system/drivesense.service
sudo systemctl daemon-reload
sudo systemctl enable drivesense.service
sudo systemctl start drivesense.service

