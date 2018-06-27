#!/bin/bash
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /var/api/auth-server
npm install
pm2 kill
pm2 start /var/api/auth-server/index.js --name 'auth-server-api'