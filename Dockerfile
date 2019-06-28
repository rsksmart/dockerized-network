FROM openjdk:8-jre

WORKDIR /rskj/

# forward logs to docker log collector
RUN mkdir /rskj/logs && \
    touch /rskj/logs/rsk.log && \
    ln -sf /dev/stdout /rskj/logs/rsk.log

COPY ./rskj-core-0.6.2-ORCHID-all.jar .
COPY ./rskj-core-1.0.0-PREVIEW-all.jar .
COPY ./scripts/entrypoint.sh .

ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["1.0.0-PREVIEW"]
