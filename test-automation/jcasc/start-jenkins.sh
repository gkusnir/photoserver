#! /bin/sh

docker run -it -p 8080:8080 \
           -v jenkins_home:/var/jenkins_home \
           --restart always \
           -d \
           --name jenkins jenkins:jcasc
