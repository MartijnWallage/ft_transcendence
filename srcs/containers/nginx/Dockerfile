FROM debian:bullseye

# Create a group and user
RUN groupadd -g 1000 mygroup && useradd -u 1000 -g mygroup -m myuser
RUN usermod -aG sudo myuser

RUN apt update && \
    apt upgrade -y nginx openssl dumb-init sudo

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY tools/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh


RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes -out /etc/nginx/ssl/nginx.crt -keyout /etc/nginx/ssl/nginx.key -subj "/C=DE/ST=BERLIN/L=Berlin/O=42/OU=42/CN=jubernar/UID=none"
#RUN mkdir -p /usr/local/share/ca-certificates/
# RUN cp /etc/nginx/ssl/nginx.crt /usr/local/share/ca-certificates/nginx.crt
# RUN update-ca-certificates --fresh

# RUN mkdir -p /var/run/nginx
# RUN chmod 755 /var/www/html
# RUN chown -R www-data:www-data /var/www/html

# Set the user for subsequent instructions
# Add user to sudo group and allow passwordless sudo
RUN echo 'myuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER myuser

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/docker-entrypoint.sh"]
