#!/bin/bash

MASTER= #http://172.17.10.5:3000
PORT=3000
HOSTNAME=`hostname`
LOG_DIR=/opt/logs
IP=`/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v 172.17| grep -v inet6 | awk '{print $2}' | tr -d "addr:"`
DEBUG=false

# 下面的通常没必要修改
CONTAINER_NAME=spider-agent
OPTIONS=" -v "$LOG_DIR":/opt/logs:ro"
OPTIONS=$OPTIONS" -v /opt/applications:/opt/spider/applications:ro "
OPTIONS=$OPTIONS" -e DEBUG="$DEBUG" "
case "$1" in
    start)
        docker rm -f $CONTAINER_NAME
        docker run -d -p $PORT:3000 -e PORT=$PORT -e HOSTNAME=$HOSTNAME -e IP=$IP -e MASTER=$MASTER --hostname=$HOSTNAME  $OPTIONS --name $CONTAINER_NAME spider /opt/spider/run.sh
        nohup docker logs -f $CONTAINER_NAME > ${CONTAINER_NAME}.log 2>&1 &
        tail -f ${CONTAINER_NAME}.log
        ;;

    stop)
        docker stop $CONTAINER_NAME
        echo stop success
        ;;

    restart)
        $0 stop
        sleep 2
        $0 start
        ;;

    *)
        echo "usage: $0 start|stop|restart"
        ;;

esac