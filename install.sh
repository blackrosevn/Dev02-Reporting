
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

# Create project directory
PROJECT_DIR="/home/gsm/vinatex"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone/copy project files (assuming files are in current directory)
cp -r * $PROJECT_DIR/

# Install npm dependencies
npm install

# Set environment variables
cat > .env << EOL
DATABASE_URL=postgresql://gsm:gsm@localhost:5432/vinatex
NODE_ENV=production
EOL

# Setup PM2 for process management
sudo npm install -g pm2

# Build the project
npm run build

# Setup PM2 startup script
sudo pm2 startup ubuntu
pm2 start dist/index.js --name vinatex
pm2 save

# Create info.txt with credentials
cat > info.txt << EOL
Installation completed at $(date)

Database Information:
- Host: localhost
- Port: 5432
- Database: vinatex
- Username: gsm
- Password: gsm

Application Access:
- URL: http://localhost:5000
- Admin username: admin
- Admin password: admin123

Process Management:
- PM2 is used to manage the application
- View status: pm2 status
- View logs: pm2 logs vinatex
- Restart app: pm2 restart vinatex
EOL

# Set proper permissions
sudo chown -R gsm:gsm $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

echo "Installation completed! Check info.txt for credentials and details."
