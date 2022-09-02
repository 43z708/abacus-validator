FROM python:3.9

ARG pip_installer="https://bootstrap.pypa.io/get-pip.py"
ARG awscli_version="1.25.65"

COPY ./initialize-env.sh /opt/initialize-env.sh

RUN pip install awscli==${awscli_version} &\
  pip install --user --upgrade aws-sam-cli
ENV PATH $PATH:/root/.local/bin

RUN apt-get update && apt-get install -y less vim-gtk nano jq && echo set clipboard=unnamedplus >> ~/.vimrc && mkdir src
WORKDIR /src
CMD ["/bin/bash", "/opt/initialize-env.sh.sh"]
