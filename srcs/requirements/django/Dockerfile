FROM debian:bullseye
# FROM python:3.12.1-slim-bullseye 
# might be a better choice, but there is no shell to go around the system.

WORKDIR /django-files/

COPY src/ .

RUN apt-get update && apt-get install -y python3.9 python3-pip

RUN python3 -m pip install Django

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]