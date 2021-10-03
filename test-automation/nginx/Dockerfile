FROM nginx:latest

# inspiration:
# https://medium.com/rahasak/setup-lets-encrypt-certificate-with-nginx-certbot-and-docker-b13010a12994
# https://gitlab.com/rahasak-labs/nginx-ops/-/blob/master/nginx-letsencrypt/Dockerfile
# https://github.com/JonasAlfredsson/docker-nginx-certbot/blob/master/src/Dockerfile


# install certbot
# Do a single run command to make the intermediary containers smaller.
RUN set -ex && \
# Install packages necessary during the build phase (for all architectures).
    apt-get update && \
    apt-get install -y --no-install-recommends \
            build-essential \
            cargo \
            curl \
            libffi6 \
            libffi-dev \
            libssl-dev \
            openssl \
            procps \
            python3 \
            python3-dev \
    && \
# Install the latest version of PIP, Setuptools and Wheel.
    curl -L 'https://bootstrap.pypa.io/get-pip.py' | python3 && \
# Install certbot.
    pip3 install -U cffi certbot \
    && \
# Remove everything that is no longer necessary.
    apt-get remove --purge -y \
            build-essential \
            cargo \
            curl \
            libffi-dev \
            libssl-dev \
            python3-dev \
    && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /root/.cache && \
    rm -rf /root/.cargo && \
# Create new directories and set correct permissions.
    mkdir -p /var/www/letsencrypt && \
    mkdir -p /etc/nginx/user_conf.d && \
    chown www-data:www-data -R /var/www \
    && \
# Make sure there are no surprise config files inside the config folder.
    rm -f /etc/nginx/conf.d/*

# remove docker-entrypoint.d and docker-entrypoint.sh
#RUN rm -fr /docker-entrypoint.d 
#RUN rm -f /docker-entrypoint.sh

# add entrypoing
#ADD docker-entrypoint.sh /docker-entrypoint.sh

# deamon mode off
#RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf
#RUN chown -R www-data:www-data /var/lib/nginx

# expose ports
EXPOSE 80 443

# add nginx staging conf
ADD config/vm.napadovisko.sk-staging.conf /etc/nginx/conf.d/vm.napadovisko.sk.conf

# work dir
#WORKDIR /etc/nginx

# make certs dir as volume
VOLUME /etc/letsencrypt

#CMD ["/etc/nginx/docker-entrypoint.sh"]
