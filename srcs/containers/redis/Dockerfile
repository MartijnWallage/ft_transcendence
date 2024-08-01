# Use the official Redis image as the base image
FROM redis

# Copy your custom redis.conf file to the container's Redis configuration directory
COPY conf/redis.conf /usr/local/etc/redis/redis.conf

# Optionally, you can run additional commands if needed
# For example, to set the working directory
WORKDIR /usr/local/etc/redis

# Expose the Redis port (not strictly necessary if using docker-compose.yml to expose ports)
EXPOSE 6379

# Command to run Redis with your custom configuration
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
