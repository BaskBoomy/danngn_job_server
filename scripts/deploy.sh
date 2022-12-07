#!/bin/bash
echo 'cd /home/ec2-user/danngn_job_server' >> /home/ec2-user/danngn_job_server/deploy.log
cd /home/ec2-user/danngn_job_server >> /home/ec2-user/danngn_job_server/deploy.log

echo 'npm run pm2' >> /home/ec2-user/danngn_job_server/deploy.log 
npm run pm2  >> /home/ec2-user/danngn_job_server/deploy.log
# git pull
# npm install
# npm run build
# pm2 reload ecosystem.config.js --env production
# EOF