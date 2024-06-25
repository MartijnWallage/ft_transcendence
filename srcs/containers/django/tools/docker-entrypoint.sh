#!/bin/bash
set -e

# # Generate openssl certificate
# if [ ! -f "/etc/daphne/ssl/daphne.crt" ] || [ ! -f "/etc/daphne/ssl/daphne.key" ]; then
#     echo "Generating openssl certificate..."
#     mkdir -p /etc/daphne/ssl
#     openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#             -keyout /etc/daphne/ssl/daphne.key \
#             -out /etc/daphne/ssl/daphne.crt \
#             -subj "/C=DE/L=Berlin/O=42Berlin/CN=nginx" \
#             > /dev/null 2>&1
#     echo "Generated openssl certificate."
# fi

# Set the working directory
cd /home/app/web/

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

# python3 manage.py migrate
# python3 manage.py migrate
# python3 manage.py collectstatic --noinput

# Always run collectstatic
echo "Collecting static files..."
python3 manage.py collectstatic --noinput

if [ "$DJANGO_INITIAL_SETUP" = "true" ]; then
    python3 manage.py makemigrations
    python3 manage.py migrate
    python3 manage.py createsuperuser
fi

gunicorn pong.wsgi:application --bind 0.0.0.0:8000
# python3 manage.py runserver 0.0.0.0:8000

 
# # Starts the daphne server, a server specifically for handling Django Channels applications.
# # config.asgi:application: Specifies the ASGI application to run, defined in the config module.
# # exec daphne -b 0.0.0.0 -e ssl:8443:privateKey=/etc/daphne/ssl/daphne.key:certKey=/etc/daphne/ssl/daphne.crt config.asgi:application
# daphne -b 0.0.0.0 -e ssl:8443:privateKey=/etc/daphne/ssl/daphne.key:certKey=/etc/daphne/ssl/daphne.crt myproject.asgi:application

