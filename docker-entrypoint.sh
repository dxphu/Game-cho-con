#!/bin/sh
set -e

# Create a small runtime config that the frontend can read.
# `API_KEY` is optionally provided by Docker Swarm service environment.
cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  API_KEY: "${API_KEY}"
};
EOF

exec nginx -g 'daemon off;'
