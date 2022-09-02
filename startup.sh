if [ ! -e ./get-aws-kms-address/.exec-once ]; then
	  yarn install && touch ./get-aws-kms-address/.exec-once
fi
ts-node index.ts
