FROM debian:bullseye

RUN apt update -y && apt upgrade -y && apt install nginx -y && apt install curl -y && apt install procps -y 

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -out /etc/nginx/ssl/inception.crt -keyout /etc/nginx/ssl/inception.key -subj "/C=DE/ST=BERLIN/L=Berlin/O=42/OU=42/CN=jubernar/UID=none"

RUN mkdir -p /var/run/nginx

COPY conf/nginx.conf /etc/nginx/nginx.conf

RUN chmod 755 /var/www/html

RUN chown -R www-data:www-data /var/www/html


ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
