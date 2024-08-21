#!/bin/bash
set -e

sudo mkdir -p $APP_HOME/media/ && sudo chown -R myuser:mygroup $APP_HOME/media/ && sudo chmod -R 755 $APP_HOME/media/

echo "creating ssl folder..."
sudo mkdir -p /tmp/daphne/ssl
echo "creating ssl keys..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /tmp/daphne/ssl/daphne.key \
        -out /tmp/daphne/ssl/daphne.crt \
        -subj "/C=DE/L=Berlin/O=42Berlin/CN=nginx" 

echo "Waiting for database to be ready..."
retries=5
# Uses nc (netcat) to check 
# if the database service on host database is listening on port 5432. 
# The -z flag tells nc to just scan for the listening daemons, without sending any data.
#while ! nc -z postgresSQL 5432; do
#	sleep 1
#	retries=$((retries - 1))
#	# If the retry counter reaches 0, it prints an error
#	if [ $retries -le 0 ]; then
#		echo "Database is not available, exiting..."
#		exit 1
#	fi
#done
#echo "Database is ready!"

# Always run collectstatic
echo "Collecting static files..."
sudo -E python3 manage.py collectstatic --noinput

if [ "$DJANGO_INITIAL_SETUP" = "true" ]; then
	python3 manage.py makemigrations
	python3 manage.py migrate
	python3 manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL
fi

sudo python3 manage.py makemigrations pong
python3 manage.py makemigrations
python3 manage.py migrate


exec daphne -b 0.0.0.0 -e ssl:8443:privateKey=/tmp/daphne/ssl/daphne.key:certKey=/tmp/daphne/ssl/daphne.crt transcendence.asgi:application
# python3 manage.py runserver 0.0.0.0:8000
