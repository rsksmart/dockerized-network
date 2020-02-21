FROM node:lts-alpine

RUN apk add --no-cache \
    python \
    make \
    g++

COPY package.json package-lock.json ./
RUN npm install
COPY wait-for-rskj.sh test-pre-migration.js test-post-migration.js ./
COPY /Contracts ./
COPY /Contracts/HelloWorld.json ./Contracts

ENTRYPOINT ["sh", "wait-for-rskj.sh", "full1"]
CMD ["npm", "test"]