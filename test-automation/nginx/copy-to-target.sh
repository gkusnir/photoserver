#! /bin/sh

USER=gkusnir
TARGET=vm.napadovisko.sk:/home/$USER/nginx

scp -r ./* $USER@$TARGET
