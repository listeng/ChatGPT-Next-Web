rm -rf ./app
mkdir ./app
mkdir ./app/public
mkdir ./app/.next
cp -R ../public/. ./app/public
cp -R ../.next/standalone/. ./app
cp -R ../.next/static ./app/.next
cp -R ../.next/server ./app/.next

export dd=$(date '+%Y%m%d%H%M')
docker build -t nextweb:v$dd .
docker tag nextweb:v$dd nextweb:latest
