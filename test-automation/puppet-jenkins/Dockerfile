FROM jenkins/ssh-agent:alpine

# https://www.cloudsavvyit.com/13461/how-to-run-puppeteer-and-headless-chrome-in-a-docker-container/
# https://stackoverflow.com/questions/36399848/install-node-in-dockerfile/67491580#67491580
# https://github.com/nodejs/docker-node/issues/1005#issuecomment-468737069

WORKDIR /node_home
COPY package.json .
COPY package-lock.json .

RUN apk update && \
    apk add --no-cache npm && \
    npm install npm@latest -g && \
    npm install n -g && \
    n latest && \
    npm ci

VOLUME /node_home

WORKDIR /var/jenkins_home

