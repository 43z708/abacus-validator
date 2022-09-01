# Unofficial tool to easily build Abacus validator

## Overview

Abacus is an interchain messaging protocol that allows applications to communicate between blockchains.
This repository is designed to make it easy to run Abacus' Validator.
Official Abacus documentation can be found [here](https://docs.useabacus.network/abacus-docs/validators/getting-started).

## How to install

This repository is configured to run multiple chains of docker containers on a single machine.
**The official machine size recommendation is 2 CPU + 2Gb RAM, so if you want to run multiple chains of validators, you will need a machine that is the right size for that number of validators.**

### 1. install this repository

\*reqired Docker, docker-compose

```
git clone https://github.com/43z708/abacus-validator.git
cd abacus-validator
```

### 2. Set up resources for each chain in AWS

1. Configure resources in the AWS Console

2. Configure resources in the AWS Cli

docker-compose -f docker-compose-pre.yaml run --rm aws-cli bash

aws cloudformation deploy \
 --template-file /src/cloudformation.yaml \
 --capabilities CAPABILITY_NAMED_IAM \
 --stack-name "abacus-polygon" \
 --parameter-overrides Chain=polygon ValidatorName=kiyo

aws cloudformation delete-stack \
 --stack-name "abacus-polygon"

aws cloudformation describe-stacks \
 --stack-name "abacus-polygon"

aws cloudformation list-stacks \
 --stack-status-filter CREATE_COMPLETE

AWS 設定のテスト：public key がかえってくれば問題なし
CHAIN={チェーン名} docker compose -f docker-compose-pre.yaml run --rm kms
でテスト可能
例：
CHAIN=ethereum docker compose -f docker-compose-pre.yaml run --rm kms

ノード稼働

docker compose -f docker-compose-prod.yaml up ethereum -d
