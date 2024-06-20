# ft_transcendence

ft_transcendence in development

# Hope this will help a little bit

## Setting up Django in your Computer/Virtual Box
### 1.  Install Python3 (If not installed Already)
### 2.  Install pip3
### 3.  Install pipenv using pip3
      a) pip3 install pipenv or
      b) sudo apt install pipenv(for me only this worked)
### 4. Go to the project folder and
     a) pipenv install django
     b) pipenv shell
     c) code .
### 5. Create a project Pong
    django-admin startproject pong .

## Run your Django Server
    python manage.py startapp playpong
    python manage.py runserver
    ("Deciding a port number is optional by default 8000")

## Setting in the files to make Pong.js and Pong.html work

- in settings.py append playpong
- ![image](https://github.com/MartijnWallage/ft_transcendence/assets/123320243/9a16d89b-ba4e-4177-a807-e4be73c75971)

- INSTALLED_APPS [
-   'playpong'
- ]

- add this as well
- ![image](https://github.com/MartijnWallage/ft_transcendence/assets/123320243/9536940b-ca7a-445d-95b0-f86c8e5ecb6e)

  ### inside playpong Folder create 2 folder templates and static and put pong.js and pong.html
  
  ![image](https://github.com/MartijnWallage/ft_transcendence/assets/123320243/d14c4532-99b0-42c6-a761-5eec510227a1)

  make these changes in pong.html
  
  ![image](https://github.com/MartijnWallage/ft_transcendence/assets/123320243/bdff81ff-c288-45c0-bd10-364ae9d2a50d)


  ### in playpong/views.py define a function like this
  ![image](https://github.com/MartijnWallage/ft_transcendence/assets/123320243/beac7562-77ca-44bf-95a6-eb9e529572e8)

  ### finally we need to have playpong/urls.py to call our function make it like this
  ![image](https://github.com/MartijnWallage/ft_transcendence/assets/123320243/314b5369-645f-4f1e-bbd7-c946d0831ca8)

  ### Also inside the pong/urls.py make these changes
  ![image](https://github.com/MartijnWallage/ft_transcendence/assets/123320243/fc9d085b-8001-4a83-8870-be40e56bd9f3)


## IF the server is already running from before it will update itself after saving all files.
## To start again
  python manage.py runserver

  ## Path to the pong game as described above
  http://127.0.0.1:8000/playpong/hello/