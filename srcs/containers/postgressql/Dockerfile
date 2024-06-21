FROM postgres:17beta1-bullseye

# Create a group and user
RUN groupadd -g 1000 mygroup && useradd -u 1000 -g mygroup -m myuser

# Set the user for subsequent instructions
USER myuser