#!/bin/bash
git pull
npm install
npm run build
pm2 reload ecosystem.config.ts --env production
# EOF