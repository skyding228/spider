#!/bin/bash
MASTER=
PORT=3000
HOSTNAME=`hostname`
LOG_DIR=/opt/logs
IP=`/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v 172.17| grep -v inet6 | awk '{print $2}' | tr -d "addr:"`

case "$1" in
    start)
        docker rm -f spider-web
        docker run -d -p $PORT:3000 -e PORT=$PORT -e HOSTNAME=$HOSTNAME -e IP=$IP -e MASTER=$MASTER -v $LOG_DIR:/opt/logs:ro --name spider-web spider-web /opt/spider/run.sh
        nohup docker logs -f spider-web > spider-web.log 2>&1 &
        tail -f spider-web.log
        ;;

    stop)
        docker stop spider-web
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