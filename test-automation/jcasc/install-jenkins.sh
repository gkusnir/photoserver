#! /bin/sh

# install jenkins docker 
VOLUME_NAME=jenkins_jcasc_volume
IMAGE_TAG=jenkins:jcasc

# test if docker exists
which docker > /dev/null
res=$?
if [ $res -eq 1 ] 
then
    echo "docker command does not exist"
    exit 1
fi

# build image jenkins:jcasc
docker build -t $IMAGE_TAG .
res=$?
if [ $res -eq 1 ] 
then
    echo "docker build error"
    exit 1
fi

# create a named volume
docker volume create $VOLUME_NAME
res=$?
if [ $res -eq 1 ] 
then
    echo "docker volume error"
    exit 1
fi

echo "finished with success"
exit 0
