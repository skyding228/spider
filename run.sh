#!/bin/bash
cd `dirname $0`
git pull
cnpm install
npm run start