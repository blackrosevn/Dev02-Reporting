#!/bin/bash

# Hiển thị tiêu đề
echo "=== Kiểm tra trạng thái Vinatex Report Portal ==="
echo "Thời điểm: $(date)"

# Kiểm tra xem pm2 đã được cài đặt chưa
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 chưa được cài đặt. Tiến hành cài đặt..."
    npm install -g pm2 || { echo "Không thể cài đặt PM2. Kiểm tra quyền npm."; exit 1; }
fi

# Kiểm tra trạng thái dịch vụ
echo "Kiểm tra trạng thái ứng dụng..."
if pm2 list | grep -q "vinatex-reports"; then
    PM2_STATUS=$(pm2 show vinatex-reports | grep -o "status.*online\|status.*stopped\|status.*errored" | awk '{print $2}')
    
    if [ "$PM2_STATUS" = "online" ]; then
        echo "✅ Ứng dụng đang chạy bình thường."
        echo "URL truy cập: http://$(hostname -I | awk '{print $1}'):5000"
        
        # Kiểm tra xem có thể truy cập API
        echo "Kiểm tra kết nối API..."
        API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/me 2>/dev/null || echo "failed")
        
        if [ "$API_STATUS" = "401" ]; then
            echo "✅ API hoạt động bình thường (trả về 401 Unauthorized là đúng vì chưa đăng nhập)."
        else
            echo "⚠️ API trả về mã lỗi: $API_STATUS"
            echo "Thử khởi động lại ứng dụng..."
            pm2 restart vinatex-reports
            sleep 5
            echo "Trạng thái sau khi khởi động lại: $(pm2 show vinatex-reports | grep -o "status.*online\|status.*stopped\|status.*errored" | awk '{print $2}')"
        fi
    else
        echo "❌ Ứng dụng không hoạt động (trạng thái: $PM2_STATUS)"
        echo "Đang khởi động lại ứng dụng..."
        pm2 restart vinatex-reports
        sleep 5
        NEW_STATUS=$(pm2 show vinatex-reports | grep -o "status.*online\|status.*stopped\|status.*errored" | awk '{print $2}')
        
        if [ "$NEW_STATUS" = "online" ]; then
            echo "✅ Ứng dụng đã được khởi động lại thành công."
        else
            echo "❌ Không thể khởi động lại ứng dụng. Trạng thái hiện tại: $NEW_STATUS"
            echo "Kiểm tra logs để biết chi tiết lỗi: pm2 logs vinatex-reports"
        fi
    fi
else
    echo "❌ Ứng dụng chưa được khởi động với PM2."
    echo "Thử khởi động lại ứng dụng..."
    
    # Kiểm tra xem package.json có script start không
    if grep -q '"start":' package.json; then
        pm2 start npm --name vinatex-reports -- start
        sleep 5
        if pm2 list | grep -q "vinatex-reports.*online"; then
            echo "✅ Ứng dụng đã được khởi động thành công."
        else
            echo "❌ Không thể khởi động ứng dụng."
            echo "Kiểm tra logs: pm2 logs vinatex-reports"
        fi
    else
        echo "❌ Không tìm thấy script start trong package.json. Cài đặt lại với ./install.sh."
    fi
fi

# Kiểm tra kết nối đến cơ sở dữ liệu
echo ""
echo "Kiểm tra kết nối PostgreSQL..."
DB_NAME="vinatex_reports"
DB_USER="vinatex_user"

if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ Cơ sở dữ liệu $DB_NAME tồn tại."
    
    # Kiểm tra người dùng
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null | grep -q 1; then
        echo "✅ Người dùng $DB_USER tồn tại."
    else
        echo "❌ Người dùng $DB_USER không tồn tại!"
        echo "Cần cài đặt lại với ./install.sh"
    fi
else
    echo "❌ Cơ sở dữ liệu $DB_NAME không tồn tại!"
    echo "Cần cài đặt lại với ./install.sh"
fi

# Kiểm tra file .env 
echo ""
echo "Kiểm tra cấu hình môi trường..."
if [ -f .env ]; then
    echo "✅ File .env tồn tại."
    ENV_CONTENT=$(cat .env | grep -v "^#" | grep -v "^$")
    echo "Nội dung (không hiển thị mật khẩu):"
    echo "$ENV_CONTENT" | sed 's/\(.*PASSWORD=\).*/\1********/'
else
    echo "❌ File .env không tồn tại. Cần cài đặt lại."
fi

# Kiểm tra bộ nhớ và CPU
echo ""
echo "Kiểm tra tài nguyên hệ thống..."
echo "CPU usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'
echo "Memory usage:"
free -m | awk 'NR==2{printf "Used: %s MB (%.2f%%)\n", $3, $3*100/$2 }'

# Hiển thị các lệnh hữu ích
echo ""
echo "=== Các lệnh hữu ích ==="
echo "Xem logs chi tiết:        pm2 logs vinatex-reports"
echo "Khởi động lại ứng dụng:   pm2 restart vinatex-reports"
echo "Dừng ứng dụng:            pm2 stop vinatex-reports"
echo "Cài đặt lại hoàn toàn:    ./install.sh"