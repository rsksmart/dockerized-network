FROM openjdk:8-jre

WORKDIR /rskj/

# forward logs to docker log collector
RUN mkdir /rskj/logs && \
    touch /rskj/logs/rsk.log && \
    ln -sf /dev/stdout /rskj/logs/rsk.log

COPY ./rskj-core-1.2.1-WASABI-all.jar .
COPY ./rskj-core-1.3.0-WASABI-all.jar .
COPY ./rskj-core-2.0.0-SNAPSHOT-all.jar .
COPY ./scripts/entrypoint.sh .

ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["2.0.0-SNAPSHOT"]
