#!/bin/bash
PWD=`dirname $0`
cd $PWD
git pull
./init.sh
cd $PWD
cnpm install
npm run start