# Sửa lỗi "Docker Virtualization not enabled on your machine"

## Triệu chứng
Khi khởi động Docker Desktop trên Windows, bạn nhận được hộp thoại cảnh báo lỗi:
> **"Docker Virtualization not enabled on your machine"** hoặc **"Hardware assisted virtualization and data execution protection must be enabled in the BIOS"**

Ứng dụng Docker Desktop không thể khởi động thành công và hiển thị trạng thái dừng (stopped).

---

## Nguyên nhân
Lỗi này xảy ra khi Docker Desktop không thể tiếp cận các tính năng ảo hóa phần cứng của CPU (Intel VT-x hoặc AMD-V) hoặc môi trường ảo hóa của Windows (WSL 2 / Hyper-V) đang bị vô hiệu hóa hoặc bị xung đột bởi phần mềm khác.

---

## Các bước khắc phục chi tiết

### Bước 1: Kiểm tra trạng thái ảo hóa trong Task Manager
Trước tiên, bạn cần xác minh xem phần cứng máy tính của mình đã kích hoạt ảo hóa hay chưa:
1. Nhấn tổ hợp phím `Ctrl + Shift + Esc` để mở **Task Manager**.
2. Chọn tab **Performance** (Hiệu năng) ở danh mục bên trái, sau đó chọn **CPU**.
3. Quan sát mục **Virtualization** (Ảo hóa) ở góc dưới bên phải:
   - Nếu hiển thị **Enabled**: Tính năng ảo hóa phần cứng đã được bật trong BIOS. Lỗi có thể nằm ở cấu hình Windows (xem tiếp Bước 3).
   - Nếu hiển thị **Disabled**: Bạn bắt buộc phải bật tính năng này trong BIOS của máy tính (xem tiếp Bước 2).

---

### Bước 2: Bật ảo hóa (Virtualization) trong BIOS/UEFI
Nếu trạng thái hiển thị là **Disabled**, bạn cần khởi động lại máy để vào BIOS/UEFI bật ảo hóa:
1. Khởi động lại máy tính. Trong quá trình máy bắt đầu lên, nhấn liên tục phím truy cập BIOS (thường là `F2`, `F10`, `F12` hoặc `Delete` tùy dòng máy HP, Dell, Asus, Lenovo, Acer...).
2. Tìm kiếm mục cấu hình liên quan đến CPU (thường nằm ở tab **Advanced**, **CPU Configuration** hoặc **Chipset**):
   - **Đối với CPU Intel:** Tìm và chọn **Enabled** cho mục **Intel Virtualization Technology**, **Intel VT-x**, hoặc **Vanderpool**.
   - **Đối với CPU AMD:** Tìm và chọn **Enabled** cho mục **SVM Mode** hoặc **AMD-V**.
3. Nhấn phím `F10`, chọn **Yes** để lưu cấu hình và khởi động lại vào Windows. Sau khi vào Windows, kiểm tra lại Task Manager xem đã chuyển sang **Enabled** chưa.

---

### Bước 3: Kích hoạt WSL 2 và Virtual Machine Platform trên Windows
Docker Desktop yêu cầu các tính năng nền của Windows dưới đây hoạt động bình thường:
1. Mở **PowerShell** bằng quyền Administrator (nhấp chuột phải vào nút Start -> chọn *Terminal (Admin)* hoặc *PowerShell (Admin)*).
2. Chạy câu lệnh sau để cài đặt và kích hoạt toàn bộ các tính năng ảo hóa hệ thống của Windows:
   ```powershell
   wsl.exe --install --no-distribution
   ```
3. Sau khi lệnh chạy hoàn tất, **bắt buộc phải khởi động lại máy tính** để Windows áp dụng các thay đổi.

---

### Bước 4: Kiểm tra xung đột với phần mềm chống gian lận (Anti-Cheat)
Một số phần mềm diệt virus hoặc chương trình chống gian lận game chạy ở cấp độ nhân hệ điều hành (Kernel-level) có thể chặn quyền tiếp cận ảo hóa của Docker:
- **Riot Vanguard** (Phần mềm chống gian lận đi kèm với các game của Riot như *Valorant*, *League of Legends*): Đây là nguyên nhân cực kỳ phổ biến gây xung đột khiến Docker báo lỗi Virtualization.
- **Cách khắc phục:**
  1. Nhấp chuột phải vào biểu tượng Vanguard ở khay hệ thống (System Tray) góc dưới bên phải màn hình.
  2. Chọn **Exit Vanguard** để tạm thời tắt chương trình.
  3. Khởi động lại Docker Desktop xem lỗi đã được giải quyết chưa. Nếu giải quyết được, bạn nên thiết lập tắt tự khởi động Vanguard khi mở máy và chỉ bật khi chơi game.
