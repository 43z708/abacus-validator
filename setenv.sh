#! /bin/bash

keys=(AwsAccessKeyId AwsSecretAccessKey KmsKeyId ValidatorName AbcValidatorCheckpointsyncerBucket AbcValidatorRegion AbcValidatorCheckpointsyncerRegion AbcBaseValidatorRegion)

rm -f ./chain/$chain/.env
for key in ${keys[@]}; do
echo -n $key | sed -r -e 's/([a-zA-Z])([A-Z])/\1_\l\2/g' -e 's/\b([A-Z])/\l\1/g' | sed 's/.\+/\U\0/' >> ./chain/$chain/.env &
wait
echo -n = >> ./chain/$chain/.env &
aws cloudformation describe-stacks \
 --stack-name "abacus-$chain" | jq -r ".Stacks[] | .Outputs[] | select(.OutputKey == \"$key\") | .OutputValue " >> ./chain/$chain/.env
done

echo ABC_BASE_OUTBOX_CONNECTION_URL= >> ./chain/$chain/.env &
echo ABC_BASE_METRICS= >> ./chain/$chain/.env

echo "abacus-validator/chain/$chain/.env is created"