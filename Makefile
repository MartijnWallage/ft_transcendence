# -----------\ Name \--------------------------------------------------------- #

NAME	:= transcendance

# -----------\ Files \-------------------------------------------------------- #

ENV_FILE = --env-file srcs/.env
COMPOSE = ./srcs/docker-compose.yml
COMPOSE_CMD = docker compose -f ${COMPOSE} ${ENV_FILE}
# -----------\ Directories \-------------------------------------------------- #

DATABASE_DIR := M_database
DJANGO_DIR := M_django-data

# -----------\ Rules \-------------------------------------------------------- #

all: $(NAME)

$(NAME):	
	@${COMPOSE_CMD} up
	
build:
	@${COMPOSE_CMD} up --build

down:
	@${COMPOSE_CMD} down

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

