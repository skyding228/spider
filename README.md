# spider
用于整合分布式目录,进行文件查看。每台主机上运行一个docker容器，把想要对外提供访问的目录挂载到容器的/opt/logs(可配置)目录下，
可以在Master节点上查看所有节点上的文件了.

# 构建docker 容器
`./bin/build.sh`

# 运行
`./spider.sh start`
运行之前可以修改对应的参数(spider.sh中):
- MASTER
想把目录在哪个节点上访问,http://ip:port

- PORT
默认3000

- HOSTNAME
用于在Master节点上显示的名称，默认使用`hostname`命令获取，可以直接配置为想要显示的名称

- IP
这个要网络可以访问的IP，默认使用`/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v 172.17| grep -v inet6 | awk '{print $2}' | tr -d "addr:"`获取，如果有多个公网IP时可以明确指定

- LOG_DIR
想要对外提供访问的宿主机上的目录,默认`/opt/logs`

# 如何对外提供多个目录访问？
把想要对外提供访问的目录挂载到容器的`/opt/logs`目录下，修改`spider.sh`;
例如：想要对外提供/opt/web,/opt/java目录，修改`spider.sh`的启动命令,添加`-v /opt/web:/opt/logs/web:ro -v /opt/java:/opt/logs/java:ro`