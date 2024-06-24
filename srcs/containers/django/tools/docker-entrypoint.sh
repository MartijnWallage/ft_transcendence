#!/bin/bash
set -e

# # Generate openssl certificate
# if [ ! -f "/etc/daphne/ssl/daphne.crt" ] || [ ! -f "/etc/daphne/ssl/daphne.key" ]; then
#     echo "Generating openssl certificate..."
#     sudo mkdir /etc/daphne/ssl
#     openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#             -keyout /etc/daphne/ssl/daphne.key \
#             -out /etc/daphne/ssl/daphne.crt \
#             -subj "/C=DE/L=Berlin/O=42Berlin/CN=nginx" \
#             > /dev/null 2>&1
#     echo "Generated openssl certificate."
# fi

# Set the working directory
cd /django-files/

    echo "Waiting for database to be ready..."
    retries=5
    # Uses nc (netcat) to check 
    # if the database service on host database is listening on port 5432. 
    # The -z flag tells nc to just scan for the listening daemons, without sending any data.
    while ! nc -z postgressql 5432; do
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
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000

