FROM openjdk:8-jre

WORKDIR /rskj/

# forward logs to docker log collector
RUN mkdir /rskj/logs && \
    touch /rskj/logs/rsk.log && \
    ln -sf /dev/stdout /rskj/logs/rsk.log

COPY ./rskj-core-2.2.0-SNAPSHOT-all.jar .
COPY ./rskj-core-2.1.0-PAPYRUS-all.jar .
COPY ./scripts/entrypoint.sh .

ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["2.2.0-SNAPSHOT"]
