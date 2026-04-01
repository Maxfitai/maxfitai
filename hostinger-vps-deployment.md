## Hostinger VPS Deployment Guide

### Prerequisites

1. **Hostinger VPS** with SSH access
2. **GitHub Repository** with this project

### Step 1: VPS Setup

SSH into your Hostinger VPS and run the setup script:

```bash
# SSH into your VPS
ssh root@82.25.109.171

# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/maxfitai/main/scripts/vps-setup.sh -o vps-setup.sh
bash vps-setup.sh
```

Or manually:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl start docker
systemctl enable docker
```

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

| Secret Name    | Value                                     |
| -------------- | ----------------------------------------- |
| `VPS_HOST`     | Your VPS IP address (e.g., `192.168.1.1`) |
| `VPS_USERNAME` | SSH username (usually `root`)             |
| `VPS_SSH_KEY`  | Your SSH private key (PEM content)        |

#### Generating SSH Key for VPS Access

If you don't have an SSH key for the VPS:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "deploy@maxfitai"

# Copy the public key to VPS
ssh-copy-id root@YOUR_VPS_IP

# Copy the private key content (add to GitHub secrets)
cat ~/.ssh/id_ed25519
```

### Step 3: Configure Environment Variables

Create `.env.production` file with your production environment variables:

```env
# Database
DATABASE_URI=mongodb://mongo:27017/maxfitai

# Payload
PAYLOAD_SECRET=your-secret-key-here

# Public URL
PAYLOAD_PUBLIC_SERVER_URL=http://YOUR_VPS_IP:3000

# Add other required environment variables
```

### Step 4: Deploy

**Automatic Deployment (Recommended):**

Push to main branch to trigger deployment:

```bash
git add .
git commit -m "Setup CI/CD"
git push origin main
```

**Manual Deployment:**

Go to GitHub → Actions → Deploy to Production → Run workflow

### Step 5: Verify Deployment

After deployment, check if the application is running:

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Check container status
docker ps

# View logs
docker logs maxfitai-app

# Check if port 3000 is listening
curl http://localhost:3000
```

### Troubleshooting

#### Container won't start

```bash
docker logs maxfitai-app
```

#### Check container resources

```bash
docker stats maxfitai-app
```

#### Restart the container

```bash
docker restart maxfitai-app
```

#### Update without GitHub Actions

```bash
# SSH into VPS
docker pull ghcr.io/YOUR_USERNAME/maxfitai:latest
docker stop maxfitai-app && docker rm maxfitai-app
docker run -d --name maxfitai-app -p 3000:3000 --restart unless-stopped ghcr.io/YOUR_USERNAME/maxfitai:latest
```

### Notes

- The workflow uses GitHub Container Registry (GHCR) to store the Docker image
- Each push to `main` branch triggers automatic deployment
- MongoDB runs in a separate container on the same Docker network