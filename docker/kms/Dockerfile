FROM node:14

COPY ./startup.sh /opt/startup.sh

RUN apt-get update && \
  apt-get install -y yarn &&\
  mkdir -p /get-aws-kms-address &&\
  sed -i 's/\r//g' /opt/startup.sh &&\
  yarn global add ts-node
WORKDIR /get-aws-kms-address
ENTRYPOINT ["/bin/bash", "/opt/startup.sh"]

