# -----------\ Name \--------------------------------------------------------- #

NAME	:= transcendance

# -----------\ Files \-------------------------------------------------------- #

ENV_FILE = --env-file srcs/.env
COMPOSE = ./srcs/docker-compose.yml
COMPOSE_CMD = docker compose -f ${COMPOSE} ${ENV_FILE}
# -----------\ Directories \-------------------------------------------------- #

DATABASE_DIR := M_database
DJANGO_DIR := M_django-data
FRONTEND_DIR := M_frontend
#DIST_DIR := M_dist


# -----------\ Rules \-------------------------------------------------------- #

all: $(NAME)

$(NAME):	
	mkdir -p $(DATABASE_DIR)
	mkdir -p $(DJANGO_DIR)
	mkdir -p $(FRONTEND_DIR)
#	mkdir -p $(DIST_DIR)
	@${COMPOSE_CMD} up -d
	
build:
	@${COMPOSE_CMD} up --build -d

down:
	@${COMPOSE_CMD} down -d

clean:
	@echo "clean"
	-docker ps -qa | xargs docker stop
	-docker ps -qa | xargs docker rm
	-docker image ls -qa | xargs docker rmi -f
	-docker volume ls -q | xargs docker volume rm
	-docker network ls -q | xargs
	-docker network ls -q | xargs docker network rm 2>/dev/null

fclean: clean
	-chmod 777 $(DJANGO_DIR)
	-rm -rf $(DJANGO_DIR)
	docker run -it --rm -v ./M_database:/delete debian:latest bash -c "rm -rf /delete/*"
	@$(MAKE) clean
	-chmod 777 $(DATABASE_DIR)
	-rm -rf $(DATABASE_DIR)
	docker system prune -f

re: fclean all

.PHONY: all build down re clean fclean

