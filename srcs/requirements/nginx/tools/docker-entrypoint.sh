# #!/bin/bash

# #Ensures the script exits immediately 
# #if any command returns a non-zero status.
set -e

#Redirects Nginx logs to standard output and standard error. 
#This is useful for Docker containers since it allows logs 
#to be captured by the Docker logging system and viewed 
#with 'docker logs'.
ln -sf /dev/stdout /var/log/nginx/access.log && \
ln -sf /dev/stderr /var/log/nginx/error.log

# # Function to generate a self-signed SSL certificate if not already present
# generate_ssl_cert() {
#     local cert_file="/etc/nginx/ssl/nginx.crt"
#     local key_file="/etc/nginx/ssl/nginx.key"

#     # Check if the certificate files already exist
#     if [ ! -f "$cert_file" ] || [ ! -f "$key_file" ]; then
#         echo "Generating self-signed SSL certificate..."

#         mkdir -p /etc/nginx/ssl
#         openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#             -keyout "$key_file" \
#             -out "$cert_file" \
#             -subj "/C=DE/L=Berlin/O=Berlin/CN=nginx" \
#             > /dev/null 2>&1
#         # Silence all output from the openssl command

#         echo "Self-signed SSL certificate generated."
#     fi

#     # Copy the certificate to the CA certificates directory
#     cp "$cert_file" /usr/local/share/ca-certificates/nginx.crt
#     update-ca-certificates --fresh
# }

# # Call the function to generate the SSL certificate
# generate_ssl_cert

# # Execute nginx
# #This is necessary to start the Nginx server and keep the container running
exec nginx -g "daemon off;"
