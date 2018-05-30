#!/bin/bash

#MASTER=http://10.65.215.14:3000
PORT=3030
HOSTNAME=`hostname`
IP=`/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v 172.| grep -v inet6 | awk '{print $2}' | tr -d "addr:"`
DEBUG=true
SINGULARITY_DIR=/opt/mesos/workspace/slaves/7227a537-90b6-4377-85ab-af8b9091e58f-S57/frameworks/Singularity
DOCKER_DIR=/var/lib/docker/

# 下面的通常没必要修改
CONTAINER_NAME=spider-mesos
OPTIONS="-v"$SINGULARITY_DIR":/singularity -v"$DOCKER_DIR":/var/lib/docker/"
OPTIONS=$OPTIONS" -v /bin/docker:/bin/docker  -v /var/run/docker.sock:/var/run/docker.sock "
OPTIONS=$OPTIONS" -e DEBUG="$DEBUG" "
case "$1" in
    start)
        docker rm -f $CONTAINER_NAME
        docker run --privileged --restart=always -itd -p $PORT:3000 -e PORT=$PORT -e HOSTNAME=$HOSTNAME -e IP=$IP -e MASTER=$MASTER --hostname=$HOSTNAME  $OPTIONS --name $CONTAINER_NAME skyding/spider-mesos
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