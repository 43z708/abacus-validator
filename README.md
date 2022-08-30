
AWS設定のテスト：public keyがかえってくれば問題なし
CHAIN={チェーン名} docker compose -f docker-compose-test.yaml run --rm nodejs
でテスト可能
例：
CHAIN=ethereum docker compose -f docker-compose-test.yaml run --rm nodejs

ノード稼働
