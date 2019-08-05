FROM node:lts-alpine

RUN apk add --no-cache \
    python \
    make \
    g++

COPY package.json package-lock.json ./
COPY ./Contracts ./Contracts
RUN npm install
COPY smoke-test.js ./
COPY wait-for-rskj.sh ./

ENTRYPOINT ["sh", "wait-for-rskj.sh", "full1"]
CMD ["npm", "test"]