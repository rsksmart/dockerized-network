FROM openjdk:8-jre
WORKDIR /rskj/
COPY ./rskj-core-0.6.2-ORCHID-all.jar .
COPY ./rskj-core-1.0.0-PREVIEW-all.jar .
COPY ./scripts/entrypoint.sh .
ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["1.0.0-PREVIEW"]