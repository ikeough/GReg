#! /bin/bash

mkdir -p /home/ec2-user/logs
sudo -E NODE_ENV=production forever start -a -o /home/ec2-user/logs/OUT -e /home/ec2-user/logs/ERR -l /home/ec2-user/logs/LOG greg-server/app.js

