FROM node:8
MAINTAINER ShangHai skyding <1329555958@qq.com>

WORKDIR /opt/logs
RUN cd /opt && git clone https://github.com/1329555958/spider.git
RUN cd /opt/spider && npm install
RUN apt-get update
RUN apt-get install lrzsz
RUN rm -f ~/.bashrc
RUN mv /opt/spider/bin/bashrc ~/.bashrc
RUN rm -rf /opt/yarn-v1.5.1
RUN chmod +x /opt/spider/run.sh
CMD ["/opt/spider/run.sh"]