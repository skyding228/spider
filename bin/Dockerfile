FROM node:8
MAINTAINER ShangHai skyding <1329555958@qq.com>

WORKDIR /opt/logs
RUN apt-get update
RUN apt-get install -y lrzsz
RUN apt-get install -y vim
RUN echo "syntax on" >> /etc/vim/vimrc
RUN cd / && git clone https://github.com/1329555958/spider.git
RUN cd /spider && git checkout mesos && npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cd /spider && cnpm install
RUN apt-get install -y nginx
RUN rm -f /etc/nginx/nginx.conf
RUN cp /spider/bin/nginx.conf /etc/nginx/
RUN rm -f ~/.bashrc
RUN cp /spider/bin/bashrc ~/.bashrc
RUN cp /spider/bin/bashrc /home/node/.bashrc
RUN rm -rf /opt/yarn-*
RUN chmod +x /spider/run.sh
RUN echo "root:1qazXSW@vf" | chpasswd
CMD ["/spider/run.sh"]