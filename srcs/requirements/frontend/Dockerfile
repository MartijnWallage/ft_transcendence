# Use a base image with Node.js
FROM node:18

# Create the npm folder in the expected directory
RUN mkdir -p /usr/src/app

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
# COPY app/package*.json /usr/src/app/package.json
COPY app/package*.json ./

# Install dependencies
RUN npm install -g npm@latest

# Copy the rest of the application files to the working directory
# COPY app /usr/src/app
COPY app .

# Expose the port your app runs on (if applicable)
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
