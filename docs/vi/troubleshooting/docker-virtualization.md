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

### Bước 2: Bật ảo hóa (Virtualization) trong BIOS/UEFI thông qua Windows Settings
Nếu trạng thái ảo hóa là **Disabled**, bạn có thể truy cập BIOS/UEFI trực tiếp từ Windows Settings mà không cần căn phím nhấn khi khởi động:
1. Mở ứng dụng **Settings** (Cài đặt) trên Windows (phím tắt `Windows + I`).
2. Chọn **System** (Hệ thống) -> **Recovery** (Phục hồi).
3. Tại mục **Advanced startup** (Khởi động nâng cao), nhấn nút **Restart now** (Khởi động lại ngay) và xác nhận restart.
4. Máy tính sẽ khởi động lại vào màn hình xanh tùy chọn của Windows. Nhấp chọn: **Troubleshoot** (Khắc phục sự cố) -> **Advanced options** (Tùy chọn nâng cao) -> **UEFI Firmware Settings** và nhấn **Restart**.
5. Máy tính sẽ tự động truy cập thẳng vào giao diện cài đặt BIOS/UEFI. Tìm kiếm mục cấu hình CPU (thường ở tab *Advanced*, *CPU Configuration* hoặc *Chipset*):
   - **Đối với CPU Intel:** Tìm và chọn **Enabled** cho mục **Intel Virtualization Technology**, **Intel VT-x**, hoặc **Vanderpool**.
   - **Đối với CPU AMD:** Tìm và chọn **Enabled** cho mục **SVM Mode** hoặc **AMD-V**.
6. Nhấn phím `F10`, chọn **Yes** để lưu cấu hình và khởi động lại.

---

### Bước 3: Kích hoạt WSL 2, Virtual Machine Platform và Hyper-V bằng Windows GUI
Thay vì dùng dòng lệnh, bạn có thể dễ dàng kích hoạt các thành phần ảo hóa của hệ điều hành thông qua giao diện Windows:
1. Nhấn phím `Windows`, nhập tìm kiếm cụm từ **"Turn Windows features on or off"** (hoặc **"Bật hoặc tắt tính năng Windows"**) và nhấn Enter để mở cửa sổ tính năng.
2. Cuộn tìm và đánh dấu tích chọn (check) vào các ô tính năng sau:
   - **Virtual Machine Platform** (Nền tảng máy ảo)
   - **Windows Subsystem for Linux** (Subsystem của Windows dành cho Linux)
   - **Hyper-V** (Lưu ý: Chỉ khả dụng trên Windows Pro, Enterprise hoặc Education. Nếu bạn đang sử dụng phiên bản Windows Home, bạn sẽ không thấy tùy chọn Hyper-V này. Đừng lo lắng, Docker Desktop vẫn hoạt động tốt thông qua nền tảng WSL 2 đã bật ở trên).
3. Nhấn **OK** và đợi Windows tự động cài đặt các cấu hình cần thiết.
4. Chọn **Restart now** (Khởi động lại ngay) để hệ thống áp dụng thay đổi.

---

### Bước 4: Kiểm tra xung đột với phần mềm chống gian lận (Anti-Cheat)
Một số phần mềm diệt virus hoặc chương trình chống gian lận game chạy ở cấp độ nhân hệ điều hành (Kernel-level) có thể chặn quyền tiếp cận ảo hóa của Docker:
- **Riot Vanguard** (Phần mềm chống gian lận đi kèm với các game của Riot như *Valorant*, *League of Legends*): Đây là nguyên nhân cực kỳ phổ biến gây xung đột khiến Docker báo lỗi Virtualization.
- **Cách khắc phục:**
  1. Nhấp chuột phải vào biểu tượng Vanguard ở khay hệ thống (System Tray) góc dưới bên phải màn hình.
  2. Chọn **Exit Vanguard** để tạm thời tắt chương trình.
  3. Khởi động lại Docker Desktop xem lỗi đã được giải quyết chưa. Nếu giải quyết được, bạn nên thiết lập tắt tự khởi động Vanguard khi mở máy và chỉ bật khi chơi game.
