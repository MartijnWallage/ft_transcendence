# Use an official Node.js runtime as a parent image
FROM node:14

# Install Truffle and Ganache CLI
RUN npm install -g truffle@5.4.0 ganache-cli

# Install Python and Web3.py
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install web3

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy Truffle configuration and migration files
COPY truffle-config.js ./
COPY contracts/ ./contracts/
COPY migrations/ ./migrations/

# Expose port for Ganache
EXPOSE 8545

# Copy startup script
COPY tools/startup.sh /usr/src/app/startup.sh
RUN chmod +x /usr/src/app/startup.sh

# Set the entry point
ENTRYPOINT ["/usr/src/app/startup.sh"]
