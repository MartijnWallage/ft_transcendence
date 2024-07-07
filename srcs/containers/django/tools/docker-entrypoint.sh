#!/bin/bash
set -e

# Generate openssl certificate
mkdir -p /tmp/daphne/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /tmp/daphne/ssl/daphne.key \
        -out /tmp/daphne/ssl/daphne.crt \
        -subj "/C=DE/L=Berlin/O=42Berlin/CN=nginx" \
        > /dev/null 2>&1

echo "Waiting for database to be ready..."
retries=5
# Uses nc (netcat) to check 
# if the database service on host database is listening on port 5432. 
# The -z flag tells nc to just scan for the listening daemons, without sending any data.
while ! nc -z postgresSQL 5432; do
	sleep 1
	retries=$((retries - 1))
	# If the retry counter reaches 0, it prints an error
	if [ $retries -le 0 ]; then
		echo "Database is not available, exiting..."
		exit 1
	fi
done
echo "Database is ready!"

# Always run collectstatic
echo "Collecting static files..."
sudo -E python3 manage.py collectstatic --noinput

if [ "$DJANGO_INITIAL_SETUP" = "true" ]; then
	#python3 manage.py makemigrations
	python3 manage.py migrate
	#python3 manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL
fi

# Daphne is a WebSocket server
# used with Django Channels to handle WebSocket connections in Django applications.
exec daphne -b 0.0.0.0 -e ssl:8443:privateKey=/tmp/daphne/ssl/daphne.key:certKey=/tmp/daphne/ssl/daphne.crt mywebsite.asgi:application
