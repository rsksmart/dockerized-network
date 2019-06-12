FROM node:lts-alpine

RUN apk add --no-cache \
    python \
    make \
    g++

WORKDIR /wasabi-opcodes

COPY package.json package-lock.json ./
RUN npm install
COPY wait-for-rskj.sh truffle-config.js ./
COPY contracts/ ./contracts
COPY migrations/ ./migrations
COPY test/ ./test

ENTRYPOINT ["sh", "wait-for-rskj.sh", "miner"]
CMD ["npm", "test"]