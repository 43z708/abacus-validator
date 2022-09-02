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

1. Download this source code

```
git clone https://github.com/43z708/abacus-validator.git
```

2. Go to abacus-validator directory

```
cd abacus-validator
```

### 2. Set up resources for each chain in AWS

You will need to enter the variables in the .env file you just created above, so set up the AWS resources for each chain.(Make sure your current directory is avacus-validator.)

1. First, create an IAM User to access AWS with aws-cli.

(1) Access to IAM
![IAM](https://user-images.githubusercontent.com/52235419/188061153-5ba1bd8e-f3e7-4ec2-9f1c-6461f28a73ce.png)

(2) Create the policy for IAM User
![Create-Policy](https://user-images.githubusercontent.com/52235419/188061473-20c96f1f-92f4-4120-a291-a7bcf40eea21.png)

(3) Copy the contents of "aws-cli-policies.json" file

```
cat aws-cli-policies.json
```

Make a copy of what you see in the cat command.

(4) Paste it into the AWS json screen.
Click on the JSON tab and delete all of the first contents. Then, paste the contents of "aws-cli-policies.json" file you just copied above.
![Create-Policy2](https://user-images.githubusercontent.com/52235419/188062282-8a24df98-9fb9-4723-9383-9d91fb36c4cf.png)
Click the "Next: Tags" button in the lower right corner, and click the "Next: Review" button on the next screen as well.

(5) Give it any name and click the "Create policy" button.
![Create-Policy3](https://user-images.githubusercontent.com/52235419/188062939-57b3be8d-ce95-411a-b423-62643808e460.png)

(6) Create IAM User
![Create-User](https://user-images.githubusercontent.com/52235419/188063321-9a286dad-e9c6-41ac-96e3-c09c1d23f154.png)

(7) Give it any name, check the Access key and click the "Next: Permission" button.
![Create-User2](https://user-images.githubusercontent.com/52235419/188063556-2be285d9-863b-4878-850d-2d0163327c6d.png)

(8) Click on the "Attach existing policies directly" tab, check the policies you have just created up to 5), and click on the "Next: tags" button at the bottom right.
![Create-User3](https://user-images.githubusercontent.com/52235419/188063913-e317d451-769b-4d7f-8a75-c674a1bd147f.png)
Click the "Next: Review" button in the lower right corner, and click the "Create User" button on the next screen as well.

(9) The "Access key ID" and "Secret access key" will be displayed on the next screen. Please be careful not to leak this information to anyone.

![Create-User4](https://user-images.githubusercontent.com/52235419/188064400-0f919f85-90d0-400e-bf80-5a3dca0965e7.png)

Use these keys to configure the following aws-cli settings.

2. Configure the aws-cli.

(1) Create the .env file to be used for aws-cli with the following command.

```
cp .env.sample .env
```

(2) Edit the .env file created above with vim, nano, etc.
Set the Access key ID in AWS_ACCESS_KEY_ID, the Secret access key in AWS_SECRET_ACCESS_KEY, and the region you wish to set in AWS_DEFAULT_REGION.
The region should be copied as shown below, selecting the region you wish to set up from the menu in the upper right corner of the AWS screen.Resources for all future validator sets will be created in the selected region.

![region](https://user-images.githubusercontent.com/52235419/188065804-2d9a5bd3-8f43-41aa-9160-8b8c259408a1.png)

".env" file will be created as follows.

![.env](https://user-images.githubusercontent.com/52235419/188066439-28873fcf-39e1-4ea6-9a3b-05771956a19a.png)

3. Run aws-cli to create a resource for each chain.

(1) Launch a docker container running aws-cli with the following command and login to the container.

```
docker-compose -f docker-compose-pre.yaml run --rm aws-cli bash
```

(2) Use cloudformation to create all the AWS resources needed for the validator at once, chain by chain.

Execute the command with <chain name> being the chain you wish to create, and <validator name> being any name without spaces or special characters.

Currently the chains that can be configured are arbitrum,avalanche,bsc,celo,ethereum,optimism,polygon.(Chain names must be set in all lowercase letters)

```
aws cloudformation deploy \
 --template-file /src/cloudformation.yaml \
 --capabilities CAPABILITY_NAMED_IAM \
 --stack-name "abacus-<chain name>" \
 --parameter-overrides Chain=<chain name> ValidatorName=<validator name>

# example
aws cloudformation deploy \
 --template-file /src/cloudformation.yaml \
 --capabilities CAPABILITY_NAMED_IAM \
 --stack-name "abacus-ethereum" \
 --parameter-overrides Chain=ethereum ValidatorName=kiyo
```

**Ref: Command to see a list of stacks being created.**

```
aws cloudformation list-stacks \
 --stack-status-filter CREATE_COMPLETE
```

**Ref: Command to delete a stack.**

```
aws cloudformation delete-stack \
 --stack-name "abacus-<chain name>"

# example
aws cloudformation delete-stack \
 --stack-name "abacus-ethereum"
```

(3) After the stack has been created, use the following command to create the .env file in each chain directory to configure the validator.

```
chain=<chain name> bash ./setenv.sh

# example
chain=ethereum bash ./setenv.sh
```

After executing this command, abacus-validator/chain/<chain name>/.env is created.

4. Set up "./abacus-validator/chain/<chain name>/.env" file

(1) Get the rpc URL for each chain from a service such as Alchemy or infura.

(2) Use this command to modify the .env file.

```
vim ./chain/<chain name>/.env

# example
vim ./chain/ethereum/.env
```

(3) Press the "i" key to switch to edit mode.
Copy and paste the rpc URL obtained in 1) after ABC_BASE_OUTBOX_CONNECTION_URL=.

(4) After ABC_BASE_METRICS=, specify the port to be used for metrics. The official recommendation is 9090, but if you are running multiple chains of validators on a single machine, set different ports so that the chains do not overlap.

(5) Press the "esc" key and use the ":wq" command to save and exit.

[**Ref: This commando is a test for AWS resources(This outputs an Ethereum address for a given AWS KMS key.)**](https://github.com/tkporter/get-aws-kms-address)

```
CHAIN=<chain name> docker compose -f docker-compose-pre.yaml run --rm kms

# example
CHAIN=ethereum docker compose -f docker-compose-pre.yaml run --rm kms
```

### 3. Run a validator for each chain

1. Run the validator with the following command.

```
docker compose -f docker-compose-prod.yaml up <chain name> -d
# example
docker compose -f docker-compose-prod.yaml up ethereum -d
```

2. Reach out on #validators on Discord when you are ready to be added to the validator set.

(1) You can check if the docker container is running

```
docker compose -f docker-compose-prod.yaml ps
# or
docker compose -f docker-compose-prod.yaml logs ethereum
# etc...
```

(2) Finally, if there are no errors or other problems, try accessing the following URL.

```
https://abacus-validator-signatures-<validator name>-<chain name>.s3.<region>.amazonaws.com/checkpoint_latest_index.json
# example
https://abacus-validator-signatures-kiyo-ethereum.s3.eu-central-1.amazonaws.com/checkpoint_latest_index.json
```

Congratulations! If the numbers are displayed, you have succeeded.
Reach out on #validators on Discord when you are ready to be added to the validator set.
