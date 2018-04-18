FROM node:8
MAINTAINER ShangHai skyding <1329555958@qq.com>

WORKDIR /opt
RUN cd /opt
RUN git clone https://github.com/1329555958/spider.git
RUN cd /opt/spider
RUN npm install
RUN apt-get update
RUN apt-get install lrzsz
RUN rm -f ~/.bashrc
RUN mv /opt/spider/bin/bashrc ~/.bashrc
RUN source ~/.bashrc

CMD ["/opt/spider/run.sh"]