#!/bin/sh

export GITLAB_HOME=/media/data/projects/gkusnir/photoserver/gitlab/data

docker run --detach --rm \
  --hostname gitlab.example.com \
  --publish 8443:443 --publish 8080:80 --publish 8022:22 \
  --name gitlab \
  --volume $GITLAB_HOME/config:/etc/gitlab \
  --volume $GITLAB_HOME/logs:/var/log/gitlab \
  --volume $GITLAB_HOME/data:/var/opt/gitlab \
  gitlab/gitlab-ee:latest

#  --restart always \
