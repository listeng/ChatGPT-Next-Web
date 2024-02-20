rm -rf ./app
mkdir ./app
mkdir ./app/public
mkdir ./app/.next
cp -R ../public/. ./app/public
cp -R ../.next/standalone/. ./app
cp -R ../.next/static ./app/.next
cp -R ../.next/server ./app/.next

tar -cvzf app.tar.gz ./app