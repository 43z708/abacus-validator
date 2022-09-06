# Unofficial tool to easily build Abacus validator

## Overview

Abacus is an interchain messaging protocol that allows applications to communicate between blockchains.
This repository is designed to make it easy to run Abacus' Validator.
Official Abacus documentation can be found [here](https://docs.useabacus.network/abacus-docs/validators/getting-started).

## Configuration diagram

![diagram](https://user-images.githubusercontent.com/52235419/188258456-a93d025b-6f52-4ad5-a360-71c409a113a1.jpg)

The resources required are as follows.

- KMS (on AWS)
A managed service that makes it easy to create and manage keys used for encryption operations, in this case, the creation of a wallet for Validator.

- S3 (on AWS)
Storage service on AWS. It is used to store images, videos, text files, etc. In this case, it serves as a warehouse to store the signatures that Validator has made against the blockchain, and Relayer comes to retrieve the signature data in this warehouse.

- IAM (on AWS)
A service that controls access privileges to services on AWS. In this case, the server running the validator must have permission to operate KMS and S3 onAWS. Therefore, the IAM Access Key Id and Secret access key are stored on the server running the validator. (which must never be leaked to the outside world).

- Server to run the Validator (Not needed on AWS)
You will need a server to run the Validator. This can be a VPS or a local PC, not EC2 on AWS.

- AWS Cloudformation (used only with this tool) *Free convenience feature
AWS Cloudformation (used only with this tool) *Free convenience feature
It is quite troublesome to create the three AWS services KMS, IAM, and S3 for each chain by snapping them together on the AWS administration screen and saving the necessary keys to the Validator running server.
Therefore, the tool uses cloudformation to create these resources at once and introduces a script that automatically stores the necessary keys on the server.
In line with this, the first step is to create an IAM with permissions to run cloudformation.

## How to install

This repository is configured to run multiple chains of docker containers on a single machine.
**The official machine size recommendation is 2 CPU + 2Gb RAM, so if you want to run multiple chains of validators, you will need a machine that is the right size for that number of validators.**

### 1. install this repository

\*reqired Docker, docker-compose

#### 1. Download this source code

```
git clone https://github.com/43z708/abacus-validator.git
```

#### 2. Go to abacus-validator directory

```
cd abacus-validator
```

### 2. Set up resources for each chain in AWS

Configure the AWS resources for each chain (make sure the directory is avacus-validator). Create an IAM User to use the service Cloudformation to create the resources at once, as just described in the configuration above.

#### 1. Create an IAM User to use AWS Cloudformation with aws-cli.

1. **Access to IAM**
   ![IAM](https://user-images.githubusercontent.com/52235419/188061153-5ba1bd8e-f3e7-4ec2-9f1c-6461f28a73ce.png)

2. **Create the policy for IAM User**
   ![Create-Policy](https://user-images.githubusercontent.com/52235419/188061473-20c96f1f-92f4-4120-a291-a7bcf40eea21.png)

3. Copy and paste a policy that sets only the necessary permissions.
This is a file that sets the privileges that allow the IAM User to use services on AWS. We have prepared a policy that sets only the minimum necessary permissions.

https://github.com/43z708/abacus-validator/blob/main/aws-cli-policies.json

Make a copy of what you see in the cat command.

In AWS, click on the JSON tab as shown below and delete all the initial content. Then paste the above code into the JSON screen.

   ![Create-Policy2](https://user-images.githubusercontent.com/52235419/188062282-8a24df98-9fb9-4723-9383-9d91fb36c4cf.png)

Click the "Next: Tags" button in the lower right corner, and click the "Next: Review" button on the next screen as well.

4. **Give it any name and click the "Create policy" button.**
   ![Create-Policy3](https://user-images.githubusercontent.com/52235419/188062939-57b3be8d-ce95-411a-b423-62643808e460.png)
Now only the authority has been created. Next, we need to create an account with this authority.

5. **Create IAM User**
   ![Create-User](https://user-images.githubusercontent.com/52235419/188063321-9a286dad-e9c6-41ac-96e3-c09c1d23f154.png)

6. **Give it any name, check the Access key and click the "Next: Permission" button.**
   ![Create-User2](https://user-images.githubusercontent.com/52235419/188063556-2be285d9-863b-4878-850d-2d0163327c6d.png)

7. **Click on the "Attach existing policies directly" tab, check the policies you have just created up to 4), and click on the "Next: tags" button at the bottom right.**
   ![Create-User3](https://user-images.githubusercontent.com/52235419/188063913-e317d451-769b-4d7f-8a75-c674a1bd147f.png)

Click the "Next: Review" button in the lower right corner, and click the "Create User" button on the next screen as well.
You now have an account with Cloudformation privileges that allows you to create all the AWS services needed for this Validator at once.

8. **The "Access key ID" and "Secret access key" will be displayed on the next screen. Please be careful not to leak this information to anyone.**

![Create-User4](https://user-images.githubusercontent.com/52235419/188064400-0f919f85-90d0-400e-bf80-5a3dca0965e7.png)

You need to store these keys on the server where you plan to run Validator. Configure aws-cli (a library that allows you to use AWS services with commands instead of snapping to the administration screen) as follows.

#### 2. Configure the aws-cli.

1. **Create the .env file to be used for aws-cli with the following command.**

```
cp .env.sample .env
```

2. **Edit the .env file created above with vim, nano, etc.**
   Set the Access key ID in AWS_ACCESS_KEY_ID, the Secret access key in AWS_SECRET_ACCESS_KEY, and the region you wish to set in AWS_DEFAULT_REGION.
   The region should be copied as shown below, selecting the region you wish to set up from the menu in the upper right corner of the AWS screen.Resources for all future validator sets will be created in the selected region.

![region](https://user-images.githubusercontent.com/52235419/188065804-2d9a5bd3-8f43-41aa-9160-8b8c259408a1.png)

".env" file will be created as follows.

![.env](https://user-images.githubusercontent.com/52235419/188066439-28873fcf-39e1-4ea6-9a3b-05771956a19a.png)

#### 3. Run aws-cli to create a resource for each chain.

1. **Launch a docker container running aws-cli with the following command and login to the container.**
*When you run this command, you're in a docker container that can run aws-cli! (Type "exit" to log out)

```
docker compose -f docker-compose-pre.yaml run --rm aws-cli bash
```

2. **Create all the AWS resources needed for the validator at once, chain by chain, using loudformation.**
Make sure you are in the src directory! If you are in the src directory, you are logged in to the container. If you are in the abacus-validator directory, the first step has failed. In this case, please check if docker or docker compose has been installed.

You can automatically create an AWS configuration for the chain in which you want to run Validator by executing the following command.
Set the name of the chain you wish to set in `<chain name>` and your name in `<validator name>`.

The chains that can currently be set with `<chain name>` are "arbitrum, avalanche, bsc, celo, ethereum, optimism, polygon" (all chain names must be set with this notation). 

*Note that if you change the notation of ethereum to eth or something else on your own, it will not work.

*If you want to run multiple chains of validators, simply repeat this command with different chain names.

* `<validator name>{ should be any name without spaces or special characters. Also, please note that the following command will generate an error if the name is the same as another person who uses this tool.

```
aws cloudformation deploy \
 --template-file /src/cloudformation.yaml \
 --capabilities CAPABILITY_NAMED_IAM \
 --stack-name "abacus-<chain name>" \
 --parameter-overrides Chain=<chain name> ValidatorName=<validator name>

// example
aws cloudformation deploy \
 --template-file /src/cloudformation.yaml \
 --capabilities CAPABILITY_NAMED_IAM \
 --stack-name "abacus-ethereum" \
 --parameter-overrides Chain=ethereum ValidatorName=kiyo
```
Replace `<chain name>` with the name of the chain you wish to set and execute. This will take a few minutes, so please be patient.

*Ref: Command to see a list of stacks being created.
```
aws cloudformation list-stacks \
 --stack-status-filter CREATE_COMPLETE
```

*Ref: Note: This command deletes a stack (group of resources).
If you have already run validator once, delete the resources on the AWS admin page before running this command because the resources exist in the s3 bucket. Otherwise, the deletion will fail.

```
aws cloudformation delete-stack \
 --stack-name "abacus-<chain name>"

// example
aws cloudformation delete-stack \
 --stack-name "abacus-ethereum"
```

3. **Once the stack (group of resources) has been created, the information needs to be retrieved and saved on the server running the validator.
The following commands will automatically create .env files in the directory for each chain and store the necessary AWS information.**

```
chain=<chain name> bash ./setenv.sh

// example
chain=ethereum bash ./setenv.sh
```

This command will create abacus-validator/chain/<chain name>/.env. (It will be created with all the information from the AWS resource we just created!)
However, the rpc information and port settings have not yet been completed.

#### 4. Update `./abacus-validator/chain/<chain name>/.env` file

1. **Get the rpc URL for each chain from a service such as [infura](https://infura.io/) or [Alchemy](https://alchemy.com/?r=zM4NzUyNjI3MDM3N).**

2. **Use this command to modify the .env file.**
vim or nano can be used.

```
vim ./chain/<chain name>/.env

// example
vim ./chain/ethereum/.env
```

3. **Press the "i" key to switch to edit mode.**
   Copy and paste the rpc URL obtained in 1. after ABC_BASE_OUTBOX_CONNECTION_URL=.

4. **After ABC_BASE_METRICS=, specify the port to be used for metrics.**
   The official recommendation is 9090, but if you are running multiple chains of validators on a single machine, set different ports so that the chains do not overlap.

5. **Press the "esc" key and use the ":wq" command to save and exit.**

6. **When you have finished setting up all the .env files for the chain in which you plan to run the validator, type "exit" and press Enter button.**
You will then be logged out of the container. (Logging out will take you back to the abcus-validator directory again.)

7. **The following command is used to test if the AWS resource has been configured correctly.**
 (if successful, it will output the wallet address for the given AWS KMS key).
*Make sure the current directory is avacus-validator.

[Reference:https://github.com/tkporter/get-aws-kms-address](https://github.com/tkporter/get-aws-kms-address)

```
CHAIN=<chain name> docker compose -f docker-compose-pre.yaml run --rm kms

// example
CHAIN=ethereum docker compose -f docker-compose-pre.yaml run --rm kms
```

### 3. Run a validator for each chain

#### 1. Run the validator with the following command.

```
docker compose -f docker-compose-prod.yaml up <chain name> -d
// example
docker compose -f docker-compose-prod.yaml up ethereum -d
```

#### 2. When you are ready to add to the validators set, post to #validators on [Discord](https://discord.gg/C55J5xHPuA).

1. **You can check if the docker container is running**

```
docker compose -f docker-compose-prod.yaml ps
// or
docker compose -f docker-compose-prod.yaml logs ethereum
// etc...
```

2. **Finally, if there are no errors or other problems, try accessing the following URL.**

```
https://abacus-validator-signatures-<validator name>-<chain name>.s3.<region>.amazonaws.com/checkpoint_latest_index.json
// example
https://abacus-validator-signatures-kiyo-ethereum.s3.eu-central-1.amazonaws.com/checkpoint_latest_index.json
```

Congratulations!
If you see the numbers, you have succeeded. Let Abacus management know by posting your above s3 endpoint to [#validators on Discord](https://discord.gg/C55J5xHPuA) as follows.

<img width="664" alt="2022-09-03_13h35_00" src="https://user-images.githubusercontent.com/52235419/188595312-35de8f88-12a7-4ee4-9894-0326255746ce.png">

* Finally, if you found this tool helpful, I would appreciate if you could add a Star to the repository.
