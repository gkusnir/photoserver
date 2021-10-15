FROM ubuntu:latest

# https://www.cloudsavvyit.com/13461/how-to-run-puppeteer-and-headless-chrome-in-a-docker-container/
# https://stackoverflow.com/questions/36399848/install-node-in-dockerfile/67491580#67491580
# https://github.com/nodejs/docker-node/issues/1005#issuecomment-468737069
# https://runnable.com/blog/9-common-dockerfile-mistakes

WORKDIR /node_home
#COPY package.json .
#COPY package-lock.json .

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    npm && \
    rm -rf /var/lib/apt/lists/* && \
    npm install npm@latest -g && \
    npm install n -g && \
    n latest && \
    npm install puppeteer



VOLUME /node_home

WORKDIR /node_home

