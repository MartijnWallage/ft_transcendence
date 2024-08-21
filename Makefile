# -----------\ Name \--------------------------------------------------------- #

NAME	:= transcendence

# -----------\ Files \-------------------------------------------------------- #

ENV_FILE = --env-file srcs/.env
COMPOSE = ./srcs/docker-compose.yml
COMPOSE_CMD = docker compose -f ${COMPOSE} ${ENV_FILE}

# -----------\ Rules \-------------------------------------------------------- #

all: $(NAME)

$(NAME):
	@${COMPOSE_CMD} up

run:
	@${COMPOSE_CMD} build
	gnome-terminal -- bash -c 'sleep 4 && google-chrome --ignore-certificate-errors https://127.0.0.1:8443/playpong/hello/ && exit'
	@${COMPOSE_CMD} up

build:
	@${COMPOSE_CMD} up --build

cloud:
	git fetch origin
	git reset --hard origin/cloud-remote
	@${COMPOSE_CMD} up --build

down:
	@${COMPOSE_CMD} down

rm_volume:
	-docker volume ls -q | xargs docker volume rm

clean:
	@echo "clean"
	-docker ps -qa | xargs docker stop
	-docker ps -qa | xargs docker rm
	-docker image ls -qa | xargs docker rmi -f
	-docker volume ls -q | xargs docker volume rm
	-docker network ls -q | xargs
	-docker network ls -q | xargs docker network rm 2>/dev/null

fclean: clean
	docker system prune -f

re: fclean all

.PHONY: all build down re clean fclean

