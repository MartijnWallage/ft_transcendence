#!/bin/bash
set -e

# Generate openssl certificate
if [ ! -f "/etc/daphne/ssl/daphne.crt" ] || [ ! -f "/etc/daphne/ssl/daphne.key" ]; then
    echo "Generating openssl certificate..."
    mkdir -p /etc/daphne/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/daphne/ssl/daphne.key \
            -out /etc/daphne/ssl/daphne.crt \
            -subj "/C=DE/L=Berlin/O=42Berlin/CN=nginx" \
            > /dev/null 2>&1
    echo "Generated openssl certificate."
fi

# Set the working directory
cd /django-files/

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
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8443


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

# # Check if Django project directory exists
# if [ -d "/django/myproject" ]; then
#     echo "Django project directory found."
#     # Change directory to Django project
#     cd /django
    
#     # Check if DJANGO_INITIAL_SETUP is true
#     if [ "$DJANGO_INITIAL_SETUP" = "true" ]; then
#         echo "Performing initial setup..."
#         echo "Current directory: $(pwd)"
#         ls -la   # Add debugging output to check current directory contents
#         # Run Django management commands
#         if python manage.py makemigrations; then
#             python manage.py migrate
#             if python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists()"; then
#                 echo "Superuser 'admin' already exists."
#             else
#                 python manage.py createsuperuser --noinput --username admin --email hongpei17@example.com
#                 echo "Superuser 'admin' created."
#             fi
#             echo "Initial setup completed."
#         else
#             echo "Failed to run Django management commands."
#             exit 1
#         fi
#     fi
    
# else
#     echo "Creating new Django project..."
#     # Create Django project
#     if django-admin startproject myproject .; then
#         echo "New Django project created."
#         # Change directory to Django project
#         cd /django
        
#         # Perform initial setup for newly created project
#         echo "Performing initial setup..."
#         echo "Current directory: $(pwd)"
#         ls -la   # Add debugging output to check current directory contents
        
#         if python manage.py makemigrations; then
#             python manage.py migrate
#             if python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists()"; then
#                 echo "Superuser 'admin' already exists."
#             else
#                 python manage.py createsuperuser --noinput --username admin --email hongpei17@example.com
#                 echo "Superuser 'admin' created."
#             fi
#             echo "Initial setup completed."
#         else
#             echo "Failed to run Django management commands."
#             exit 1
#         fi
#     else
#         echo "Failed to create Django project."
#         exit 1
#     fi
# fi

# # To debug 
# if command -v daphne >/dev/null 2>&1; then
#     echo "daphne is available"
# else
#     echo "daphne is not found in PATH"
#     exit 1
# fi

 
# # Starts the daphne server, a server specifically for handling Django Channels applications.
# # config.asgi:application: Specifies the ASGI application to run, defined in the config module.
# # exec daphne -b 0.0.0.0 -e ssl:8443:privateKey=/etc/daphne/ssl/daphne.key:certKey=/etc/daphne/ssl/daphne.crt config.asgi:application
# daphne -b 0.0.0.0 -e ssl:8443:privateKey=/etc/daphne/ssl/daphne.key:certKey=/etc/daphne/ssl/daphne.crt myproject.asgi:application

