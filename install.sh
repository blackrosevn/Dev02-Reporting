
#!/bin/bash

# Hiển thị trạng thái cài đặt
echo "=== Bắt đầu cài đặt Vinatex Report Portal ==="
echo "Thời gian bắt đầu: $(date)"

# Cập nhật package list
echo "Cập nhật danh sách gói phần mềm..."
sudo apt-get update -y || { echo "Không thể cập nhật apt. Có thể cần quyền sudo."; exit 1; }

# Cài đặt các dependencies cần thiết
echo "Cài đặt các dependencies..."
sudo apt-get install -y curl build-essential python3 python3-pip || { echo "Không thể cài đặt dependencies cơ bản"; exit 1; }

# Cài đặt Node.js 20.x
echo "Cài đặt Node.js 20.x..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js đã được cài đặt. Phiên bản hiện tại:"
    node -v
else
    echo "Node.js đã được cài đặt. Phiên bản hiện tại:"
    node -v
fi

# Cài đặt PostgreSQL
echo "Cài đặt PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "PostgreSQL đã được cài đặt thành công"
else
    echo "PostgreSQL đã được cài đặt. Phiên bản hiện tại:"
    psql --version
fi

# Tạo người dùng PostgreSQL và cơ sở dữ liệu
DB_USER="vinatex_user"
DB_PASSWORD="vinatex_password"
DB_NAME="vinatex_reports"

echo "Thiết lập cơ sở dữ liệu PostgreSQL..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Cơ sở dữ liệu $DB_NAME đã tồn tại"
else
    echo "Tạo cơ sở dữ liệu và người dùng $DB_NAME..."
    # Tạo user nếu chưa tồn tại
    if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    else
        sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    fi
    
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    echo "Cơ sở dữ liệu được tạo thành công"
fi

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

# Tạo file .env với thông tin kết nối PostgreSQL
echo "Thiết lập biến môi trường..."
cat << EOF > .env
DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
NODE_ENV=production
PORT=5000
SESSION_SECRET=vinatex-reports-portal-secret-key
EOF

chmod 600 .env

# Cài đặt dependencies
echo "Cài đặt các gói phụ thuộc..."
npm install
npm install pm2 -g

# Tạo bảng trong database
echo "Tạo schema cơ sở dữ liệu..."
npm run db:push

# Stop existing PM2 processes if any
pm2 delete vinatex-reports &>/dev/null || true

# Start with PM2
echo "Khởi động ứng dụng với PM2..."
pm2 start --name vinatex-reports npm -- start
pm2 save

# Thiết lập PM2 để tự khởi động khi reboot
echo "Thiết lập PM2 khởi động khi reboot..."
pm2 startup | tail -n 1 | bash || echo "Không thể thiết lập PM2 khởi động tự động"

# Kiểm tra xem ứng dụng đã chạy chưa
echo "Kiểm tra trạng thái ứng dụng..."
sleep 5
if pm2 status | grep -q "vinatex-reports.*online"; then
    echo "Ứng dụng đã chạy thành công!"
else
    echo "Ứng dụng chưa chạy. Kiểm tra logs với lệnh: pm2 logs vinatex-reports"
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
