# Vinatex Report Portal

Hệ thống quản lý báo cáo trực tuyến cho Tập đoàn Dệt may Việt Nam (Vinatex) và các đơn vị thành viên.

## Tính năng chính

- **Báo cáo tài chính**: Quản lý báo cáo tài chính hàng quý, năm
- **Báo cáo nhân sự**: Quản lý báo cáo nhân sự định kỳ
- **Xuất báo cáo**: Xuất báo cáo sang định dạng Excel, PDF, CSV
- **Quản lý người dùng**: Phân quyền theo vai trò (admin, ban chuyên môn, đơn vị thành viên)
- **Quản lý mẫu báo cáo**: Tạo, chỉnh sửa mẫu báo cáo với các trường tùy chỉnh
- **Theo dõi trạng thái**: Theo dõi trạng thái báo cáo (chưa nộp, đã nộp, nộp muộn, quá hạn)

## Yêu cầu hệ thống

- Ubuntu 22.04 hoặc phiên bản mới hơn
- Node.js 20.x
- PostgreSQL 14 trở lên

## Cài đặt

1. Clone repository này về máy chủ:

```bash
git clone https://github.com/vinatex/report-portal.git
cd report-portal
```

2. Chạy script cài đặt:

```bash
chmod +x install.sh
./install.sh
```

Script sẽ tự động:
- Cài đặt Node.js và PostgreSQL nếu chưa có
- Tạo cơ sở dữ liệu PostgreSQL và người dùng
- Cài đặt dependencies
- Tạo bảng trong cơ sở dữ liệu
- Thiết lập systemd service để chạy ứng dụng như một dịch vụ

3. Sau khi cài đặt, ứng dụng sẽ tự động khởi động và chạy tại:

```
http://<địa_chỉ_ip_máy_chủ>:5000
```

## Tài khoản mặc định

- **Admin**:
  - Username: admin
  - Password: admin123

- **Ban Tài chính Kế toán**:
  - Username: tckt
  - Password: vinatex123

- **Đơn vị thành viên** (ví dụ: Tổng Công ty CP Dệt May Hòa Thọ):
  - Username: htg
  - Password: vinatex123

## Kiểm tra và khắc phục sự cố

Để kiểm tra trạng thái dịch vụ và tự động khắc phục một số vấn đề thường gặp:

```bash
./check_service.sh
```

### Các lệnh hữu ích

- Xem logs chi tiết:
  ```bash
  sudo journalctl -u vinatex-reports.service -f
  ```

- Khởi động lại dịch vụ:
  ```bash
  sudo systemctl restart vinatex-reports.service
  ```

- Dừng dịch vụ:
  ```bash
  sudo systemctl stop vinatex-reports.service
  ```

## Cấu trúc dự án

- **client/**: Mã nguồn frontend (React)
- **server/**: Mã nguồn backend (Express.js)
- **shared/**: Mã nguồn dùng chung, định nghĩa schema
- **install.sh**: Script cài đặt
- **check_service.sh**: Script kiểm tra và khắc phục sự cố

## Môi trường phát triển

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng trong môi trường phát triển:
```bash
npm run dev
```

3. Ứng dụng sẽ chạy tại:
```
http://localhost:5000
```

## Cách sử dụng

1. Đăng nhập với tài khoản được cấp
2. Điều hướng đến các trang khác nhau sử dụng menu bên trái
3. Quản trị viên có thể tạo mẫu báo cáo, quản lý người dùng
4. Ban chuyên môn có thể xem và quản lý báo cáo của toàn bộ hệ thống
5. Đơn vị thành viên có thể tạo, xem và nộp báo cáo

## Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình cài đặt hoặc sử dụng, vui lòng liên hệ:
- Email: support@vinatex.com.vn
- Điện thoại: (024) 3825 7700