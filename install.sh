
#!/bin/bash

echo "Starting installation at $(date)"

# Install dependencies
npm install

# Ensure database exists
echo "Setting up database..."
if ! psql "postgresql://gsm:gsm@0.0.0.0:5432/vinatex" -c '\q' 2>/dev/null; then
    createdb -h 0.0.0.0 -U gsm vinatex
fi

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
pm2 delete vinatex-backend || true

# Start the server with PM2
cd dist && pm2 start index.js --name vinatex-backend
cd ..

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

echo "Installation completed! Check info.txt for credentials and details."
