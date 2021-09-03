#!/bin/sh

# turn on virtualenv
cd /media/data/.virtualenvs
. nodejs/bin/activate

# turn on puppeteer
cd /media/data/projects/node/.nodeenvs
. puppeteer/bin/activate

node $1
