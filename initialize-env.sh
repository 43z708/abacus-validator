#!/bin/bash
if [ -e .exec-once ]; then
touch .exec-once
chains=(arbitrum avalanche bsc celo ethereum optimism polygon)

for chain in ${chains[@]}; do
cp ./chain/$chain/.env.sample ./chain/$chain/.env
done

fi