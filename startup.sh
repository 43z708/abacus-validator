if [ ! -e ./.exec-once ]; then
	  yarn install && touch ./.exec-once
fi
ts-node index.ts
