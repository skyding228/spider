FROM node:8
MAINTAINER ShangHai skyding <1329555958@qq.com>

WORKDIR /opt/logs
RUN cd /opt && git clone https://github.com/1329555958/spider.git
RUN cd /opt/spider && npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cd /opt/spider && cnpm install
RUN apt-get update
RUN apt-get install -y lrzsz
RUN apt-get install -y vim
RUN echo "syntax on" >> /etc/vim/vimrc
RUN apt-get install -y nginx
RUN rm -f /etc/nginx/nginx.conf
RUN cp /opt/spider/bin/nginx.conf /etc/nginx/
RUN service nginx start
RUN rm -f ~/.bashrc
RUN mv /opt/spider/bin/bashrc ~/.bashrc
RUN rm -rf /opt/yarn-v1.5.1
RUN chmod +x /opt/spider/run.sh
CMD ["/opt/spider/run.sh"]