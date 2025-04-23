#!/bin/bash

# Kiểm tra hệ điều hành
if [[ ! -f /etc/lsb-release ]] || ! grep -q "Ubuntu" /etc/lsb-release; then
    echo "❌ Hệ thống yêu cầu Ubuntu. Vui lòng cài đặt trên Ubuntu 22.04 hoặc cao hơn."
    exit 1
fi

# Kiểm tra quyền sudo
if ! sudo -v; then
    echo "❌ Yêu cầu quyền sudo để cài đặt."
    exit 1
fi

# Khởi tạo log file
LOG_FILE="installation.log"
exec 1> >(tee -a "$LOG_FILE") 2>&1

echo "=== Bắt đầu cài đặt Vinatex Report Portal ==="
echo "Thời gian: $(date)"
echo "Hệ điều hành: $(lsb_release -ds)"

# Kiểm tra và cài đặt các gói cần thiết
echo "Kiểm tra và cài đặt dependencies..."
DEPS=(curl build-essential python3 python3-pip postgresql postgresql-contrib)

for dep in "${DEPS[@]}"; do
    if ! dpkg -l | grep -q "^ii.*$dep"; then
        echo "Cài đặt $dep..."
        sudo apt-get install -y "$dep" || {
            echo "❌ Không thể cài đặt $dep"
            exit 1
        }
    else
        echo "✓ $dep đã được cài đặt"
    fi
done

# Cài đặt Node.js 20.x
echo "Cài đặt Node.js 20.x..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs || {
        echo "❌ Không thể cài đặt Node.js"
        exit 1
    }
fi
echo "✓ Node.js version: $(node -v)"
echo "✓ NPM version: $(npm -v)"

# Cấu hình PostgreSQL
echo "Cấu hình PostgreSQL..."
if ! systemctl is-active --quiet postgresql; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Thiết lập database
DB_USER="vinatex_user"
DB_PASSWORD="vinatex_password"
DB_NAME="vinatex_reports"

echo "Thiết lập cơ sở dữ liệu PostgreSQL..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Cấu hình PostgreSQL cho remote access
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
echo "host    all             all             0.0.0.0/0               scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Thiết lập biến môi trường
echo "Thiết lập biến môi trường..."
cat > .env << EOF
DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
NODE_ENV=production
PORT=5000
SESSION_SECRET=$(openssl rand -hex 32)
EOF
chmod 600 .env

# Cài đặt dependencies và khởi động ứng dụng
echo "Cài đặt dependencies..."
npm ci

# Cài đặt PM2 globally
echo "Cài đặt PM2..."
sudo npm install -g pm2

# Build ứng dụng
echo "Build ứng dụng..."
npm run build

# Khởi tạo database schema
echo "Khởi tạo database schema..."
npm run db:push

# Khởi động với PM2
echo "Khởi động ứng dụng..."
pm2 delete vinatex-reports &>/dev/null || true
pm2 start npm --name vinatex-reports -- start
pm2 save

# Thiết lập PM2 startup
echo "Thiết lập PM2 startup..."
pm2 startup | tail -n1 | sudo bash

# Kiểm tra cài đặt
echo -e "\nKiểm tra cài đặt..."
./check_service.sh

echo -e "\n=== Cài đặt hoàn tất ==="
echo "Chi tiết cài đặt được lưu trong $LOG_FILE"

# Chuyển đến thư mục dự án
PROJECT_DIR="$PWD"
echo "Thư mục dự án: $PROJECT_DIR"

# Sửa package.json để thêm script start
if ! grep -q '"start":' package.json; then
    # Backup package.json
    cp package.json package.json.bak
    
    # Thêm script start
    sed -i '/"scripts": {/a\    "start": "NODE_ENV=production tsx server/index.ts",' package.json
    echo "Đã thêm script start vào package.json"
fi


# Hiển thị thông tin về cách truy cập
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo ""
echo "=== Cài đặt hoàn tất ==="
echo "Thời gian hoàn thành: $(date)"
echo ""
echo "Thông tin cơ sở dữ liệu:"
echo "- Host: localhost"
echo "- Port: 5432"
echo "- Database: $DB_NAME"
echo "- Username: $DB_USER"
echo "- Password: $DB_PASSWORD"
echo ""
echo "Thông tin truy cập ứng dụng:"
echo "- URL: http://${IP_ADDRESS}:5000"
echo "- Tài khoản Admin mặc định:"
echo "  + Username: admin"
echo "  + Password: admin123"
echo ""
echo "Quản lý tiến trình:"
echo "- Xem trạng thái: pm2 status"
echo "- Xem logs: pm2 logs vinatex-reports"
echo "- Khởi động lại: pm2 restart vinatex-reports"
echo "- Dừng ứng dụng: pm2 stop vinatex-reports"
echo ""
echo "Thông tin này đã được lưu vào file info.txt"

# Lưu thông tin vào file
cat > info.txt << EOF
Cài đặt Vinatex Report Portal
============================
Thời gian cài đặt: $(date)

Thông tin cơ sở dữ liệu:
- Host: localhost
- Port: 5432
- Database: $DB_NAME
- Username: $DB_USER
- Password: $DB_PASSWORD

Thông tin truy cập ứng dụng:
- URL: http://${IP_ADDRESS}:5000
- Tài khoản Admin mặc định:
  + Username: admin
  + Password: admin123

Quản lý tiến trình:
- Xem trạng thái: pm2 status
- Xem logs: pm2 logs vinatex-reports
- Khởi động lại: pm2 restart vinatex-reports
- Dừng ứng dụng: pm2 stop vinatex-reports
EOF

chmod 644 info.txt