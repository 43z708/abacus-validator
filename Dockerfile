FROM node:14

RUN apt-get update && \
  apt-get install -y yarn &&\
  mkdir -p /get-aws-kms-address
WORKDIR /get-aws-kms-address
RUN yarn && yarn global add ts-node

