FROM python:3.9

ARG pip_installer="https://bootstrap.pypa.io/get-pip.py"
ARG awscli_version="1.25.65"

RUN pip install awscli==${awscli_version}

RUN pip install --user --upgrade aws-sam-cli
ENV PATH $PATH:/root/.local/bin

RUN apt-get update && apt-get install -y less vim && mkdir src
WORKDIR /src
