FROM python:3.9.19-slim-bullseye

# Set environment variables
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

RUN groupadd -g 1000 mygroup && useradd -u 1000 -g mygroup -m myuser
RUN usermod -aG sudo myuser

# for postgresql
RUN apt-get update && apt-get install -y libpq-dev postgresql-client gcc openssl netcat sudo

# Set the working directory in the container
WORKDIR /django-files/

# Copy the entire Django project directory into the Docker image workdir
COPY src/ .

COPY tools/requirements.txt ../
RUN pip install --upgrade pip
RUN pip install -r ../requirements.txt;

COPY tools/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# RUN echo 'myuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
# Set the user for subsequent instructions
USER myuser

CMD ["/docker-entrypoint.sh"]
