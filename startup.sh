[ -f .exec-once ] || {
  yarn install && touch .exec-once
}
ts-node index.ts