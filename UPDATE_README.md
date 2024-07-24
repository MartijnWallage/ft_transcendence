# All the changes that are being done by me (rtimsina)

### file .env
    - // to create migrate database. 
    - DJANGO_INITIAL_SETUP = true  # Set to true or false
    - Will cause user already exist problem from docker-entrypoint.sh
    if [ "$DJANGO_INITIAL_SETUP" = "true" ]; then
	echo "making migration and creating user"
	python3 manage.py makemigrations
	python3 manage.py migrate
	python3 manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL
	export DJANGO_INITIAL_SETUP=false
    fi

## Pageloading.js

-   window.loadPage = (page) => 
-   Some lines for users changed, but will be made more beautiful with time


## base.html
- needs to be changed to show user logged in status and the name of the user

## style.css
- a css style will be updated for navbar to be visible all the time


# Current Problem

-   nav bar is in the middle
-   User logging in working but the username is not shown by navbar
-   some of the games are showing strange behaviour

