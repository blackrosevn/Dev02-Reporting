#!/bin/bash

# Kiểm tra trạng thái dịch vụ
echo "Kiểm tra trạng thái Vinatex Report Portal..."
SERVICE_STATUS=$(sudo systemctl is-active vinatex-reports.service)

if [ "$SERVICE_STATUS" = "active" ]; then
    echo "✅ Dịch vụ đang hoạt động bình thường."
    echo "URL truy cập: http://$(hostname -I | awk '{print $1}'):5000"
    
    # Kiểm tra xem có thể truy cập API
    echo "Kiểm tra kết nối API..."
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/me || echo "failed")
    
    if [ "$API_STATUS" = "401" ]; then
        echo "✅ API hoạt động bình thường (trả về 401 Unauthorized là đúng vì chưa đăng nhập)."
    else
        echo "⚠️ API trả về mã lỗi: $API_STATUS"
        echo "Thử khởi động lại dịch vụ..."
        sudo systemctl restart vinatex-reports.service
        sleep 5
        echo "Trạng thái sau khi khởi động lại: $(sudo systemctl is-active vinatex-reports.service)"
    fi
else
    echo "❌ Dịch vụ không hoạt động (trạng thái: $SERVICE_STATUS)"
    echo "Đang khởi động lại dịch vụ..."
    sudo systemctl restart vinatex-reports.service
    sleep 5
    NEW_STATUS=$(sudo systemctl is-active vinatex-reports.service)
    
    if [ "$NEW_STATUS" = "active" ]; then
        echo "✅ Dịch vụ đã được khởi động lại thành công."
    else
        echo "❌ Không thể khởi động lại dịch vụ. Trạng thái hiện tại: $NEW_STATUS"
        echo "Kiểm tra logs để biết chi tiết lỗi: sudo journalctl -u vinatex-reports.service -n 50"
    fi
fi

# Kiểm tra kết nối đến cơ sở dữ liệu
echo ""
echo "Kiểm tra kết nối PostgreSQL..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw vinatex_reports; then
    echo "✅ Cơ sở dữ liệu vinatex_reports tồn tại."
    
    # Kiểm tra người dùng
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='vinatex_user'" | grep -q 1; then
        echo "✅ Người dùng vinatex_user tồn tại."
    else
        echo "❌ Người dùng vinatex_user không tồn tại!"
    fi
else
    echo "❌ Cơ sở dữ liệu vinatex_reports không tồn tại!"
fi

# Hiển thị các lệnh hữu ích
echo ""
echo "=== Các lệnh hữu ích ==="
echo "Xem logs chi tiết:        sudo journalctl -u vinatex-reports.service -f"
echo "Khởi động lại dịch vụ:    sudo systemctl restart vinatex-reports.service"
echo "Dừng dịch vụ:             sudo systemctl stop vinatex-reports.service"
echo "Cài đặt lại hoàn toàn:    ./install.sh"