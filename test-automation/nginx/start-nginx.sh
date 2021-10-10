#! /bin/sh

# https://github.com/JonasAlfredsson/docker-nginx-certbot

docker run -it -p 80:80 -p 443:443 \
           --env CERTBOT_EMAIL=your@email.org \
           --env STAGING=1 \
           -v $(pwd)/nginx_secrets:/etc/letsencrypt \
           -v $(pwd)/user_conf.d:/etc/nginx/user_conf.d:ro \
           --name nginx-certbot jonasal/nginx-certbot:latest

#           --restart always \
