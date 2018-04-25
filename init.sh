#!/bin/bash
whoami
# change mode of some directories
chmod 700 /opt/spider

ln -s /opt/spider/applications /opt/applications
chmod 700 /opt/applications