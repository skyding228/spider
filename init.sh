#!/bin/bash
# change hostname
if [ $HOSTNAME ]; then
  hostname $HOSTNAME
fi

# change mode of some directories
chmod 700 /opt/spider
chmod 700 /opt/applications
