#!/bin/bash
# VPS Setup Script for MaxFitAI Deployment
# Run this on your Hostinger VPS as root

set -e

echo "=== Updating system packages ==="
apt update && apt upgrade -y

echo "=== Installing Docker ==="
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

echo "=== Installing Docker Compose ==="
if ! command -v docker-compose &> /dev/null; then
    apt install -y docker-compose
fi

echo "=== Starting Docker ==="
systemctl start docker
systemctl enable docker

echo "=== Configuring firewall (optional) ==="
# Uncomment the following lines to enable firewall
# apt install -y ufw
# ufw allow 22/tcp
# ufw allow 80/tcp
# ufw allow 443/tcp
# ufw enable

echo "=== Creating Docker network ==="
docker network create maxfitai-network 2>/dev/null || true

echo "=== Setup complete! ==="
echo "Now you need to:"
echo "1. Add GitHub secrets (VPS_HOST, VPS_USERNAME, VPS_SSH_KEY)"
echo "2. Make sure your .env.production is correct"
echo "3. Push to main branch to trigger deployment"
