# -----------\ Name \--------------------------------------------------------- #

NAME	:= inception

# -----------\ Directories \-------------------------------------------------- #

MARIADB_DIR := mariadb-data
DJANGO_DIR := django-data

# -----------\ Rules \-------------------------------------------------------- #

all: $(NAME)

$(NAME):	
	# mkdir mariadb-data
	mkdir $(DJANGO_DIR)
	cd srcs
	docker compose -f ./srcs/docker-compose.yml up --build
	@echo "transcendance is runing."

clean:
	@echo "fclean"
	-docker ps -qa | xargs docker stop
	-docker ps -qa | xargs docker rm
	-docker image ls -qa | xargs docker rmi -f
	-docker volume ls -q | xargs docker volume rm
	-docker network ls -q | xargs
	-docker network ls -q | xargs docker network rm 2>/dev/null

fclean: clean
	chmod 777 $(DJANGO_DIR)
	rm -rf $(DJANGO_DIR)
	# chmod 777 mariadb-data
	# rm -rf mariadb-data
	docker system prune

re: fclean all

.PHONY: all, clean, fclean, re

