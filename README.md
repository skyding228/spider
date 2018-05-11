# spider
在微服务日趋流行的今天,应用数量是直线上升,同时为了达到高可用、大流量等还会同一应用部署多个实例。这样一来，想要查看分散在各个主机上的日志，就要在不同的主机控制台之间来回切换，并且要记住每个应用及不同实例所在的主机，就没那么愉快了。
打着提升程序员的幸福指数的旗号，Spider出现了。

Spider/ˈspaɪdər/ ，蜘蛛。憧憬它可以像蜘蛛一样，把所有的主机节点织成一张蜘蛛网，我们可以像蜘蛛侠一样，在任意一个结点上可达全部结点。它使用web方式提供全网的日志访问。

[详细介绍](Introduction.md)

# 部署

## Docker 安装
- centos 6
yum install docker-io

- centos 7
yum install docker-ce

- 启动docker服务
service docker start

## 构建docker 容器
`./bin/build.sh`

## 启动服务
通过修改启动脚本`./bin/master.sh`、`./bin/agent.sh`,修改配置参数。
### 公共参数

- PORT
监听端口，默认3000

- HOSTNAME
唯一的主机名，默认使用`hostname`命令获取，可配置为固定的名称

- IP
节点机相互访问的IP(不是外部访问IP)，默认使用`/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v 172.17| grep -v inet6 | awk '{print $2}' | tr -d "addr:"`获取。
如果以上命令不能获取唯一值时，可指定固定IP地址。

- LOG_DIR
想要对外提供访问的宿主机上的目录,默认`/opt/logs`

- DEBUG
打印更多详细日志,默认false.

### master 参数

- USERS_FILE
保存用户登录信息的文件完整路径,默认`/opt/spider/users`
文件内容为每行单个用户数据`name|password(32位的MD5加密的小写字符串)`;
以下是默认信息:
```
# name | password
spider|f1a81d782dea6a19bdca383bffe68452
```
可以通过在线加密密码后把Md5密文保存在文件中。上面是用户名spider，密码spider。

- PUBLIC_URL
如果不使用Nginx代理，则无需配置。否则就是Nginx的完整代理地址。

- 启动 
启动master的节点无需再启动agent
`./bin/master.sh start`

- 停止
`./bin/master.sh stop`

### agent 参数
- MASTER
指定master的URL,http://ip:port

- 启动
`./bin/agent.sh start`

- 停止
`./bin/agent.sh stop`

# 如何对外提供多个目录访问？
把想要对外提供访问的目录挂载到容器的`/opt/logs`目录下，
例如：想要对外提供/opt/web,/opt/java目录，修改启动脚本OPTIONS参数,添加`-v /opt/web:/opt/logs/web:ro -v /opt/java:/opt/logs/java:ro`