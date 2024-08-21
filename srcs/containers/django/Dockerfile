FROM python:3.9.19-slim-bullseye

# Prevents Python from writing .pyc files (bytecode files) to disk. 
# This is useful in containerized environments to reduce filesystem writes and avoid potential conflicts.
ENV PYTHONDONTWRITEBYTECODE 1
# Ensures that Python's standard output and error streams are unbuffered. 
# outputs are immediately printed rather than being buffered, which can be helpful for logging and debugging in Docker containers.
ENV PYTHONUNBUFFERED 1

# Set environment variables
ENV HOME=/home/app
ENV APP_HOME=/home/app/web

# for postgresql
RUN apt-get update && apt-get install -y \
#	postgresql-client \
	libpq-dev \
	openssl \
	netcat \
	gcc \
	sudo

RUN groupadd -g 1000 mygroup && useradd -u 1000 -g mygroup -m myuser
RUN usermod -aG sudo myuser

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt;

RUN mkdir -p $APP_HOME
RUN mkdir $APP_HOME/static

# Create the media directory to be able to upload avatars

COPY tools/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set the working directory in the container
WORKDIR $APP_HOME
# Copy the entire Django project directory into the Docker image workdir
COPY src/ .

RUN echo 'myuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
# Set the user for subsequent instructions
# USER myuser
USER root
# RUN mkdir -p $APP_HOME/media/ \
#     && chown -R myuser:mygroup $APP_HOME/media/ \
#     && chmod -R 755 $APP_HOME/media/

CMD ["/docker-entrypoint.sh"]