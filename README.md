# spider
在微服务日趋流行的今天,应用数量是直线上升,同时为了达到高可用、大流量等还会同一应用部署多个实例。这样一来，想要查看分散在各个主机上的日志，就要在不同的主机控制台之间来回切换，并且要记住每个应用及不同实例所在的主机，就没那么愉快了。
打着提升程序员的幸福指数的旗号，Spider出现了。

Spider/ˈspaɪdər/ ，蜘蛛。憧憬它可以像蜘蛛一样，把所有的主机节点织成一张蜘蛛网，我们可以像蜘蛛侠一样，在任意一个结点上可达全部结点。它使用web方式提供全网的日志访问。

[详细介绍](Introduction.md)


# 构建docker 容器
`./bin/build.sh`

# 运行
`./spider.sh start`
运行之前可以修改对应的参数(spider.sh中):
- MASTER
想把目录在哪个节点上访问,http://ip:port,主节点无需配置此属性

- PORT
默认3000

- HOSTNAME
用于在Master节点上显示的名称，默认使用`hostname`命令获取，可以直接配置为想要显示的名称

- IP
这个要网络可以访问的IP，默认使用`/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v 172.17| grep -v inet6 | awk '{print $2}' | tr -d "addr:"`获取，如果有多个公网IP时可以明确指定

- LOG_DIR
想要对外提供访问的宿主机上的目录,默认`/opt/logs`

- USERS_FILE
只有主节点需要指定,保存用户登录信息的文件完整路径;文件内容为每行单个用户数据`name|password(32位的MD5加密的小写字符串)`;以下是默认信息:
```
# name | password
spider|f1a81d782dea6a19bdca383bffe68452
```


# 如何对外提供多个目录访问？
把想要对外提供访问的目录挂载到容器的`/opt/logs`目录下，修改`spider.sh`;
例如：想要对外提供/opt/web,/opt/java目录，修改`spider.sh`的启动命令,添加`-v /opt/web:/opt/logs/web:ro -v /opt/java:/opt/logs/java:ro`