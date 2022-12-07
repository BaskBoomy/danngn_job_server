#!/bin/bash
echo 'run after_install.sh: ' >> /home/ec2-user/danngn_job_server/deploy.log

echo 'cd /home/ec2-user/danngn_job_server' >> /home/ec2-user/danngn_job_server/deploy.log
cd /home/ec2-user/danngn_job_server >> /home/ec2-user/danngn_job_server/deploy.log

echo 'npm install' >> /home/ec2-user/danngn_job_server/deploy.log 
npm install >> /home/ec2-user/danngn_job_server/deploy.log