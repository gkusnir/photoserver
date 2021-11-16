#! /bin/bash

USER=copyuser
TARGET=vm.napadovisko.sk:/etc/automation/
PASSFILE=secrets-local/vm.napadovisko.sk-copyuser.pass.txt


folders=( jcasc nginx secrets )

files=(
    jcasc
    nginx
    secrets
    docker-compose.yml
)

for f in ${folders[@]}
do
    sshpass -f $PASSFILE scp ./$f $USER@$TARGET
done

for f in ${files[@]}
do
    sshpass -f $PASSFILE scp -r ./$f $USER@$TARGET
done

