#! /bin/bash

USER=copyuser
TARGET=vm.napadovisko.sk:/etc/automation/
PASSFILE=secrets/vm.napadovisko.sk-copyuser.pass.txt

# inject client secret from a secret file (32a1d21f0de4e551cf80) to casc.yanl
secret=$(<secrets/32a1d21f0de4e551cf80)
cp jcasc/template-casc.yaml jcasc/casc.yaml
sed -i "s/@@@@-client-secret-32a1d21f0de4e551cf80-@@@@/$secret/" jcasc/casc.yaml


folders=( jcasc nginx secrets )

files=(
    jcasc
    nginx
    secrets/
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

# remove file with secret
rm jcasc/casc.yaml
