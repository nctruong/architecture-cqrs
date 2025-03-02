npm init -y
npm install express axios events
npm install --save-dev typescript ts-node nodemon @types/express
npx tsc --init
echo '{
        "watch": ["src"],
        "ext": "ts",
        "ignore": ["node_modules"],
        "execMap": {
          "ts": "node --loader ts-node/esm"
        }
      }'> nodemon.json
mkdir src
touch readme.md
