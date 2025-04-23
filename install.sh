#!/bin/bash

# Setup log file
echo "Starting installation at $(date)"

# Create logs directory with proper permissions 
mkdir -p logs
chmod 755 logs

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL if not already installed
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
fi

# Setup PostgreSQL - drop existing database and user if they exist
sudo -u postgres psql -c "DROP DATABASE IF EXISTS vinatex;"
sudo -u postgres psql -c "DROP USER IF EXISTS gsm;"
sudo -u postgres psql -c "CREATE USER gsm WITH PASSWORD 'gsm';"
sudo -u postgres psql -c "CREATE DATABASE vinatex WITH OWNER gsm;"

# Install dependencies
npm install

# Set environment variables
cat > .env << EOL
DATABASE_URL=postgresql://gsm:gsm@0.0.0.0:5432/vinatex
NODE_ENV=production
EOL

chmod 600 .env # Secure environment file

# Build the project
npm run build

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Stop any existing PM2 processes
pm2 delete all || true

# Start the server with PM2
pm2 start dist/index.js --name vinatex-backend

# Create info.txt with credentials
cat > info.txt << EOL
Installation completed at $(date)

Database Information:
- Host: 0.0.0.0
- Port: 5432
- Database: vinatex
- Username: gsm
- Password: gsm

Application Access:
- URL: http://0.0.0.0:5000
- Admin username: admin
- Admin password: admin123

Process Management:
- PM2 is used to manage the application
- View status: pm2 status
- View logs: pm2 logs vinatex-backend
- Restart app: pm2 restart vinatex-backend

EOL

chmod 644 info.txt

# Save PM2 process list
pm2 save

# Setup PM2 startup
pm2 startup || true

echo "Installation completed! Check info.txt for credentials and details."