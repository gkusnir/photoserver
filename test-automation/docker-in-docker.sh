#! /bin/bash

my_volume=$(readlink --canonicalize $1)

docker run -ti --rm -v /var/run/docker.sock:/var/run/docker.sock -v $my_volume:/work docker
