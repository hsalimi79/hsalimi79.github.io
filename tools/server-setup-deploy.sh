#!/usr/bin/env bash
# Run ONCE on the server as root:  bash server-setup-deploy.sh "<public key line>"
# Creates an unprivileged "deploy" user that can only write to /var/www/hsalimi.
set -euo pipefail
PUB="${1:?pass the deploy public key as the first argument}"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
printf 'restrict %s\n' "$PUB" > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys
chown deploy:deploy /var/www/hsalimi /var/www/hsalimi/releases
echo "ok: deploy user ready; site dir owned by deploy"
