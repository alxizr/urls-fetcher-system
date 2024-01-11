docker volume prune -f -a

docker image prune -a -f 

docker compose down 

docker compose up -d -V --remove-orphans --force-recreate --build