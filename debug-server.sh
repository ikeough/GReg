#! /bin/bash

mkdir -p /home/ec2-user/logs
sudo -E NODE_ENV=production node greg-server/app.js
