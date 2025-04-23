
#!/bin/bash

# Setup log file
exec 1> >(tee "installation.log")
exec 2>&1

echo "Starting installation at $(date)"

# Update system
sudo apt update
sudo apt upgrade -y

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

# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

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

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup || true

echo "Installation completed! Check info.txt for credentials and details."
