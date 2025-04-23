
#!/bin/bash

# Check if PM2 process is running
echo "Checking Vinatex Report Portal status..."
if pm2 list | grep -q "vinatex-backend"; then
    echo "✅ Service is running"
    
    # Check API accessibility
    echo "Checking API connection..."
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://0.0.0.0:5000/api/me || echo "failed")
    
    if [ "$API_STATUS" = "401" ]; then
        echo "✅ API is responding (401 Unauthorized expected)"
    else
        echo "⚠️ API returned status: $API_STATUS"
        echo "Attempting service restart..."
        pm2 restart vinatex-backend
        sleep 2
        echo "Service restarted. New status: $(pm2 status vinatex-backend --no-color | grep status)"
    fi
else
    echo "❌ Service is not running"
    echo "Starting service..."
    cd dist && pm2 start index.js --name vinatex-backend
    sleep 2
    
    if pm2 list | grep -q "vinatex-backend"; then
        echo "✅ Service started successfully"
    else
        echo "❌ Failed to start service"
        echo "Check logs: pm2 logs vinatex-backend"
    fi
fi

# Check database connection
echo ""
echo "Checking database connection..."
psql "postgresql://gsm:gsm@0.0.0.0:5432/vinatex" -c '\q' 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful" 
else
    echo "❌ Database connection failed"
    echo "Creating database..."
    createdb -h 0.0.0.0 -U gsm vinatex
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Failed to create database"
    fi
fi

# Display helpful commands
echo ""
echo "=== Helpful Commands ==="
echo "View detailed logs:        pm2 logs vinatex-backend"
echo "Restart service:           pm2 restart vinatex-backend"
echo "Stop service:              pm2 stop vinatex-backend"
echo "Full reinstallation:       ./install.sh"
