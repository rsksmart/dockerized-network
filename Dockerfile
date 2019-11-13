
FROM openjdk:8-jdk-alpine as builder
ARG arg_branch=master

RUN apk add git --no-cache && apk add curl --no-cache

WORKDIR /build

RUN git clone https://github.com/rsksmart/rskj --branch ${arg_branch} --single-branch
RUN cd rskj && ./configure.sh && ./gradlew clean build -x test


FROM openjdk:8-jre
ARG arg_branch=master
ENV BRANCH ${arg_branch}
ENV JARFILE rskj.jar

WORKDIR /rskj/
COPY --from=builder /build/rskj/rskj-core/build/libs/rskj-core-*-all.jar ${JARFILE}
COPY ./scripts/entrypoint.sh .

ENTRYPOINT ["bash", "entrypoint.sh"]
