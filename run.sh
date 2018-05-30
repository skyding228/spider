#!/bin/bash
PWD=`dirname $0`
cd $PWD
# git pull
chmod +x init.sh
./init.sh
cd $PWD
#cnpm install
npm run start