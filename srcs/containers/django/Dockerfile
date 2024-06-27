FROM python:3.9.19-slim-bullseye

# set to optimize Python's performance in Docker 

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
RUN apt-get update && apt-get install -y libpq-dev postgresql-client gcc openssl netcat sudo
# RUN apt-get update && apt-get install -y libpq-dev postgresql-client gcc openssl netcat python3-pip python3-dev postgresql postgresql-contrib nginx

RUN groupadd -g 1000 mygroup && useradd -u 1000 -g mygroup -m myuser
RUN usermod -aG sudo myuser

# Create the application directory
RUN mkdir -p $APP_HOME
RUN mkdir $APP_HOME/static

# Set the working directory in the container
WORKDIR $APP_HOME

# Copy the entire Django project directory into the Docker image workdir
COPY src/ .

# Copy requirements.txt and install dependencies
COPY requirements.txt ../
RUN pip install --upgrade pip
RUN pip install -r ../requirements.txt;

# Copy and set permissions for the entrypoint script
COPY tools/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set permissions for the application directory and migrations directory
RUN chown -R myuser:mygroup $APP_HOME
RUN chmod -R 755 $APP_HOME
RUN mkdir -p $APP_HOME/playpong/migrations
RUN chown -R myuser:mygroup $APP_HOME/playpong/migrations

# Allow sudo without password for myuser
RUN echo 'myuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Set the user for subsequent instructions
USER myuser

# Run the entrypoint script
CMD ["/docker-entrypoint.sh"]

#CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]