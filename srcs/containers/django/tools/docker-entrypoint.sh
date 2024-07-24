#!/bin/bash
set -e

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
	echo "making migration and creating user"
	python3 manage.py makemigrations
	python3 manage.py migrate
	python3 manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL
	export DJANGO_INITIAL_SETUP=false
fi

gunicorn transcendence.wsgi:application --bind 0.0.0.0:8000
# python3 manage.py runserver 0.0.0.0:8000
