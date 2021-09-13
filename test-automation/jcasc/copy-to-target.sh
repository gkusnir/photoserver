#! /bin/sh

USER=gkusnir
TARGET=89.36.211.32:/home/$USER/jcasc

scp ./* $USER@$TARGET
