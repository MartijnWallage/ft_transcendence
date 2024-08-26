#!/bin/bash
set -e

sudo mkdir -p $APP_HOME/media/ && sudo chown -R myuser:mygroup $APP_HOME/media/ && sudo chmod -R 755 $APP_HOME/media/

# Always run collectstatic
echo "Collecting static files..."
sudo -E python3 manage.py collectstatic --noinput

if [ "$DJANGO_INITIAL_SETUP" = "true" ]; then
	python3 manage.py makemigrations
	python3 manage.py migrate
	python3 manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL
else
    python3 manage.py makemigrations pong
    python3 manage.py migrate
fi

#for school 
exec daphne -b 0.0.0.0 -e ssl:8443:privateKey=/tmp/daphne/ssl/daphne.key:certKey=/tmp/daphne/ssl/daphne.crt transcendence.asgi:application

# #for cloud
# exec daphne -b 0.0.0.0 -e ssl:443:privateKey=/tmp/daphne/ssl/daphne.key:certKey=/tmp/daphne/ssl/daphne.crt transcendence.asgi:application

