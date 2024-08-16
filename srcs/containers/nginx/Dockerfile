FROM nginx:1.27.0

COPY conf/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes -out /etc/nginx/ssl/nginx.crt -keyout /etc/nginx/ssl/nginx.key -subj "/C=DE/ST=BERLIN/L=Berlin/O=42/OU=42/CN=jubernar/UID=none"

WORKDIR /app
# Ensuring the media directory is accessible

## add permissions
RUN chown -R nginx:nginx /app && chmod -R 755 /app && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /etc/nginx/conf.d &&\
        chown -R nginx:nginx /etc/nginx/ssl/nginx.key
RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

        ## switch to non-root user
RUN mkdir -p /app/web/media && chown -R nginx:nginx /app/web/media && chmod -R 755 /app/web/media
USER nginx

ENTRYPOINT [ "nginx", "-g", "daemon off;"]
