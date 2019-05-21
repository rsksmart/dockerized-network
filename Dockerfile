FROM openjdk:8-jre
WORKDIR /rskj/
COPY ./rskj-core-0.6.2-ORCHID-all.jar .
COPY ./rskj-core-0.7.0-SNAPSHOT-all.jar .
COPY ./entrypoint.sh .
ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["0.7.0-SNAPSHOT"]