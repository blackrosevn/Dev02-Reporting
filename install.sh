
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

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Setup PostgreSQL
sudo -u postgres psql -c "CREATE USER gsm WITH PASSWORD 'gsm';"
sudo -u postgres psql -c "CREATE DATABASE vinatex WITH OWNER gsm;"

# Create and set permissions for project directory
PROJECT_DIR="/home/gsm/vinatex"
sudo mkdir -p $PROJECT_DIR
sudo chown gsm:gsm $PROJECT_DIR
cd $PROJECT_DIR

# Copy current directory contents to project directory
sudo cp -r . $PROJECT_DIR/

# Set permissions
sudo chown -R gsm:gsm $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

# Install dependencies
cd $PROJECT_DIR
npm install

# Set environment variables
cat > .env << EOL
DATABASE_URL=postgresql://gsm:gsm@0.0.0.0:5432/vinatex
NODE_ENV=production
EOL

# Setup PM2 for process management
sudo npm install -g pm2

# Build the project
npm run build

# Setup PM2 startup script
pm2 startup ubuntu
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u gsm --hp /home/gsm
pm2 start dist/index.js --name vinatex
pm2 save

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
- View logs: pm2 logs vinatex
- Restart app: pm2 restart vinatex
EOL

echo "Installation completed! Check info.txt for credentials and details."
