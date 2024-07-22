#!/bin/bash

# Start Ganache
ganache-cli -h 0.0.0.0 &

# Wait for Ganache to start
sleep 5

# Compile the contract
truffle compile

# Deploy the contract
node /usr/src/app/deploy.js
