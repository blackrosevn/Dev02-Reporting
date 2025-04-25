#!/bin/bash

# Hiển thị tiêu đề
echo "=== Kiểm tra trạng thái Vinatex Report Portal ==="
echo "Thời điểm: $(date)"

# Kiểm tra các tiến trình cần thiết
check_process() {
    if systemctl is-active --quiet $1; then
        echo "✓ $1 đang chạy"
        return 0
    else
        echo "❌ $1 không chạy"
        return 1
    fi
}

# Kiểm tra PostgreSQL
echo -e "\nKiểm tra PostgreSQL..."
check_process postgresql
if [ $? -eq 0 ]; then
    # Kiểm tra kết nối database
    if psql "postgresql://vinatex_user:vinatex_password@localhost:5432/vinatex_reports" -c '\q' 2>/dev/null; then
        echo "✓ Kết nối database thành công"
    else
        echo "❌ Không thể kết nối database"
    fi
fi

# Kiểm tra Node.js và NPM
echo -e "\nKiểm tra Node.js và NPM..."
if command -v node &> /dev/null; then
    echo "✓ Node.js version: $(node -v)"
    echo "✓ NPM version: $(npm -v)"
else
    echo "❌ Node.js chưa được cài đặt"
fi

# Kiểm tra PM2
echo -e "\nKiểm tra PM2..."
if command -v pm2 &> /dev/null; then
    echo "✓ PM2 đã cài đặt"
    PM2_STATUS=$(pm2 describe vinatex-reports 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✓ Ứng dụng đang chạy trên PM2"
        pm2 show vinatex-reports
    else
        echo "❌ Ứng dụng chưa chạy trên PM2"
        echo "Khởi động lại ứng dụng..."
        pm2 start npm --name vinatex-reports -- start
    fi
else
    echo "❌ PM2 chưa được cài đặt"
    sudo npm install -g pm2
fi

# Kiểm tra port
echo -e "\nKiểm tra cổng ứng dụng..."
if netstat -tulpn 2>/dev/null | grep -q ":5000"; then
    echo "✓ Cổng 5000 đang được sử dụng"
    curl -s -o /dev/null -w "✓ API phản hồi với status code: %{http_code}\n" http://localhost:5000/api/me
else
    echo "❌ Cổng 5000 không hoạt động"
fi

# Kiểm tra biến môi trường
echo -e "\nKiểm tra cấu hình..."
if [ -f .env ]; then
    echo "✓ File .env tồn tại"
    if grep -q "DATABASE_URL" .env && grep -q "NODE_ENV" .env; then
        echo "✓ Các biến môi trường cần thiết đã được cấu hình"
    else
        echo "❌ Thiếu biến môi trường trong .env"
    fi
else
    echo "❌ Không tìm thấy file .env"
fi

# Kiểm tra tài nguyên hệ thống (từ script gốc)
echo -e "\nKiểm tra tài nguyên hệ thống..."
echo "CPU usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
echo "Memory usage: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')"
echo "Disk usage: $(df -h / | awk 'NR==2{print $5}')"

echo -e "\n=== Các lệnh hữu ích ==="
echo "Xem logs: pm2 logs vinatex-reports"
echo "Khởi động lại: pm2 restart vinatex-reports"
echo "Dừng ứng dụng: pm2 stop vinatex-reports"
echo "Cài đặt lại: ./install.sh"