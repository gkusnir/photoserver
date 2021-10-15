FROM node:latest

# https://www.cloudsavvyit.com/13461/how-to-run-puppeteer-and-headless-chrome-in-a-docker-container/
# https://stackoverflow.com/questions/36399848/install-node-in-dockerfile/67491580#67491580
# https://github.com/nodejs/docker-node/issues/1005#issuecomment-468737069
# https://runnable.com/blog/9-common-dockerfile-mistakes


WORKDIR /node_home

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    && rm -rf /var/lib/apt/lists/*

RUN npm i puppeteer

VOLUME /node_home

RUN echo "node version: "$(node -v)
RUN echo "npm version: "$(npm -v)

CMD ["bash"]

