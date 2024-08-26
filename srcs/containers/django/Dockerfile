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

# Create necessary directories
RUN mkdir -p $APP_HOME/static $APP_HOME/media/ /tmp/daphne/ssl

# Create SSL certificates
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /tmp/daphne/ssl/daphne.key \
    -out /tmp/daphne/ssl/daphne.crt \
    -subj "/C=DE/L=Berlin/O=42Berlin/CN=nginx"

# Set permissions for SSL certificates
RUN chmod 700 /tmp/daphne/ssl && \
    chmod 600 /tmp/daphne/ssl/daphne.key /tmp/daphne/ssl/daphne.crt

# Set file permissions
RUN chown -R myuser:mygroup $APP_HOME/static $APP_HOME/media /tmp/daphne/ssl

COPY tools/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set the working directory in the container
WORKDIR $APP_HOME
# Copy the entire Django project directory into the Docker image workdir
COPY src/ $APP_HOME

RUN echo 'myuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
# Set the user for subsequent instructions
# USER myuser
USER root
# RUN mkdir -p $APP_HOME/media/ \
#     && chown -R myuser:mygroup $APP_HOME/media/ \
#     && chmod -R 755 $APP_HOME/media/

CMD ["/docker-entrypoint.sh"]