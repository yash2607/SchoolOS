#!/bin/sh
# Railway injects PORT — nginx must listen on it.
# Default to 80 if not set.
NGINX_PORT="${PORT:-80}"

# Substitute the port into nginx config
sed -i "s/NGINX_PORT/$NGINX_PORT/g" /etc/nginx/nginx.conf

# Start all processes via supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/schoolos.conf
