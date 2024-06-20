FROM python:3.9.19-slim-bullseye

# Set environment variables
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

# for postgresql
RUN apt-get update && apt-get install -y libpq-dev postgresql-client gcc openssl netcat

# Set the working directory in the container
WORKDIR /django-files/

# Copy the entire Django project directory into the Docker image workdir
COPY src/ .

COPY requirements.txt ../
RUN pip install --upgrade pip
RUN pip install -r ../requirements.txt;

COPY tools/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
CMD ["/docker-entrypoint.sh"]

#CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]