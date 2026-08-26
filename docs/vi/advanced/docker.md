# Docker hóa ứng dụng MERN Stack

## Giới thiệu
Khi ứng dụng MERN Stack phát triển lớn hơn, việc quản lý môi trường chạy của từng dịch vụ trở nên phức tạp. Docker giúp đóng gói toàn bộ mã nguồn cùng các thư viện cần thiết vào một **Container** độc lập, đảm bảo ứng dụng hoạt động nhất quán trên mọi thiết bị của lập trình viên và môi trường triển khai thực tế.

Bài hướng dẫn này sẽ giúp bạn đóng gói từng dịch vụ trong dự án MERN Stack (Server, Client-Admin, Client-Customer) và cách liên kết chúng lại với nhau bằng **Docker Compose**.

---

## Chuẩn bị trước khi thực hành

Trước khi bắt đầu Docker hóa dự án, bạn cần đảm bảo các công cụ cần thiết đã được cài đặt và hoạt động bình thường trên máy tính của mình.

### 1. Cài đặt Node.js và npm
Dự án MERN Stack yêu cầu cài đặt Node.js và npm. Hướng dẫn chi tiết cách cài đặt và kiểm tra phiên bản đã được trình bày cụ thể tại [Lab 1](../labs/lab1#nodejs). Bạn hãy truy cập Lab 1 để hoàn thành bước chuẩn bị này trước khi tiếp tục.

### 2. Tải và cài đặt Docker Desktop (Docker GUI)
Docker Desktop là phần mềm cung cấp giao diện đồ họa (GUI) trực quan giúp bạn dễ dàng theo dõi, quản lý, khởi động hoặc dừng các container, images, networks và volumes trực tiếp bằng giao diện mà không cần gõ lệnh.

* **Tải bộ cài đặt:** Truy cập trang chủ [Docker Desktop Download](https://www.docker.com/products/docker-desktop/) và chọn phiên bản tải về phù hợp với hệ điều hành của bạn (Windows, macOS hoặc Linux).
* **Tiến hành cài đặt:**
  - **Trên Windows:** Chạy tệp cài đặt `.exe` đã tải xuống. Hãy tích chọn **Use WSL 2 instead of Hyper-V** khi được hỏi để tối ưu hóa hiệu năng container.
  - **Lưu ý ảo hóa:** Đảm bảo bạn đã bật tính năng ảo hóa (Virtualization) trong BIOS/UEFI của máy tính (có thể kiểm tra trạng thái ảo hóa trong Task Manager -> tab Performance -> CPU).
  - **Khởi động Docker:** Sau khi cài đặt hoàn tất, hãy mở ứng dụng Docker Desktop từ màn hình Desktop hoặc menu Start.

::: tip Khắc phục sự cố cài đặt
Nếu trong quá trình khởi động hoặc chạy Docker Desktop bạn gặp lỗi **"Docker Virtualization not enabled on your machine"**, hãy tham khảo tài liệu hướng dẫn tự khắc phục tại [Hướng dẫn sửa lỗi ảo hóa Docker](../troubleshooting/docker-virtualization.md).
:::

### 3. Kiểm tra Docker hoạt động
Sau khi Docker Desktop đã chạy, hãy mở Terminal (hoặc PowerShell) và chạy lệnh sau để kiểm tra phiên bản Docker:
```bash
docker --version
```
Để kiểm tra Docker Engine đã hoạt động bình thường hay chưa, chạy thử container mẫu bằng lệnh:
```bash
docker run hello-world
```
If màn hình hiển thị thông báo chào mừng **"Hello from Docker!"**, nghĩa là Docker đã được cài đặt và hoạt động chính xác.

---

## Sơ đồ cấu trúc mạng và ánh xạ cổng (Port Mapping)

Dưới đây là sơ đồ hiển thị cách các Container Docker chạy độc lập và ánh xạ cổng kết nối ra máy tính cá nhân của bạn (Host Machine) để có thể truy cập bằng Trình duyệt hoặc Postman:

```text
       MÁY TÍNH CÁ NHÂN (HOST MACHINE)
┌──────────────────────────────────────────────┐
│  Browser/Postman                             │
│       │               │              │       │
│  (Port 3000)     (Port 3001)    (Port 3002)  │
│       │               │              │       │
│───────┼───────────────┼──────────────┼───────│
│       ▼               ▼              ▼       │
│  ┌─────────┐     ┌─────────┐    ┌──────────┐ │
│  │ server  │     │  admin  │    │ customer │ │
│  │ (3000)  │     │ (3001)  │    │  (3002)  │ │
│  └─────────┘     └─────────┘    └──────────┘ │
│       ▲               │              │       │
│       └───────────────┴──────────────┘       │
│         Docker Bridge Network (Internal)     │
│                                              │
│                  DOCKER ENGINE               │
└──────────────────────────────────────────────┘
```

---

## Phần 1: Thiết lập Dockerfile cho từng dịch vụ

Để Docker có thể build (xây dựng) môi trường cho từng ứng dụng, chúng ta cần định nghĩa một **Dockerfile** và **.dockerignore** cho từng thư mục dự án tương ứng.

### 1. Backend Server (`server/`)

Tạo tệp `server/Dockerfile`:
```dockerfile
# Sử dụng Image Node.js phiên bản 20 làm môi trường nền
FROM node:20-alpine

# Thiết lập thư mục làm việc mặc định bên trong Container
WORKDIR /app

# Sao chép các tệp package.json và package-lock.json để cài đặt thư viện
COPY package*.json ./

# Cài đặt toàn bộ các dependencies cần thiết dựa theo lockfile
RUN npm install

# Sao chép toàn bộ mã nguồn còn lại vào Container
COPY . .

# Khai báo cổng lắng nghe 3000 của server
EXPOSE 3000

# Lệnh khởi động server ở chế độ dev
CMD ["npm", "run", "dev"]
```

Tạo tệp `server/.dockerignore`:
```text
node_modules
.env
```
*(Lưu ý: Bỏ qua thư mục `node_modules` cục bộ để Docker tự tải thư viện trực tiếp bên trong Container, tránh lỗi xung đột hệ điều hành).*

::: warning Cảnh báo Bảo mật & Nguyên lý Docker
**Tuyệt đối không** sao chép tệp cấu hình `.env` vào trong Docker Image. Nếu không thêm `.env` vào `.dockerignore`, thông tin nhạy cảm (như mật khẩu cơ sở dữ liệu, khóa bảo mật) sẽ bị đóng gói vĩnh viễn vào trong Image. Khi chia sẻ Image công khai lên Docker Hub, bất kỳ ai cũng có thể giải nén và lấy được mật khẩu của bạn.

Do đó, cách làm đúng chuẩn (Best Practice) là bỏ qua tệp `.env` khi build, và nạp nó thông qua tham số `--env-file` khi chạy container bằng CLI hoặc sử dụng thuộc tính `env_file` của Docker Compose.
:::

---

### 2. Client Admin (`client-admin/`)

Tạo tệp `client-admin/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Định nghĩa biến môi trường cổng chạy của React Admin
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]
```

Tạo tệp `client-admin/.dockerignore`:
```text
node_modules
build
```

---

### 3. Client Customer (`client-customer/`)

Tạo tệp `client-customer/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Định nghĩa biến môi trường cổng chạy của React Customer
ENV PORT=3002
EXPOSE 3002

CMD ["npm", "start"]
```

Tạo tệp `client-customer/.dockerignore`:
```text
node_modules
build
```

---

## Phần 2: Build & Khởi chạy từng Container thủ công

### Bước 1: Build Docker Image cho các dịch vụ
Di chuyển vào từng thư mục tương ứng và chạy lệnh build:

1. **Build Backend Server Image:**
   ```bash
   cd server
   docker build -t mern-server:1.0 .
   ```
2. **Build Client Admin Image:**
   ```bash
   cd ../client-admin
   docker build -t mern-client-admin:1.0 .
   ```
3. **Build Client Customer Image:**
   ```bash
   cd ../client-customer
   docker build -t mern-client-customer:1.0 .
   ```

*Giải thích câu lệnh:*
- `docker build`: Yêu cầu Docker Engine xây dựng một Docker Image mới.
- `-t mern-server:1.0`: Đặt tên (tag) cho Image là `mern-server` với phiên bản `1.0`.
- `.`: Chỉ định thư mục làm việc hiện tại làm ngữ cảnh build (Build Context).

---

### Bước 2: Chạy các Container độc lập
Sau khi build xong, khởi động từng Container tương ứng:

1. **Khởi động Backend Server:**
   ```bash
   docker run -d --name mern-server-container --env-file .env -p 3000:3000 mern-server:1.0
   ```
2. **Khởi động Client Admin:**
   ```bash
   docker run -d --name mern-admin-container -p 3001:3001 mern-client-admin:1.0
   ```
3. **Khởi động Client Customer:**
   ```bash
   docker run -d --name mern-customer-container -p 3002:3002 mern-client-customer:1.0
   ```

*Giải thích câu lệnh:*
- `-d` (detached mode): Cho phép container chạy ngầm trong background, giải phóng cửa sổ dòng lệnh.
- `--name`: Đặt tên định danh dễ nhớ cho container khi chạy.
- `-p <HostPort>:<ContainerPort>`: Ánh xạ cổng (port mapping) kết nối từ cổng trên máy thật của bạn đến cổng tương ứng đang chạy của Container.
- `--env-file .env`: Nạp các biến môi trường từ tệp `.env` cục bộ vào container lúc chạy. Vì chúng ta đã bỏ qua tệp này trong `.dockerignore` để bảo mật thông tin nhạy cảm, nên ta phải nạp từ ngoài vào khi khởi động container để server có thông tin kết nối cơ sở dữ liệu.

---

### Bước 3: Kiểm nghiệm & Kiểm tra kết quả

#### 1. Kiểm tra Backend Server với Postman
- **Loại yêu cầu:** `GET`
- **Địa chỉ:** `http://localhost:3000/hello` hoặc `http://localhost:3000/api/admin/categories` (cần thêm header `x-access-token` đã đăng nhập).
- **Kết quả mong đợi:** Nhận được phản hồi định dạng JSON từ ứng dụng của bạn.

#### 2. Kiểm tra giao diện Admin & Customer với Trình duyệt
- **Địa chỉ truy cập Admin Panel:** Mở trình duyệt và truy cập `http://localhost:3001/admin`
- **Địa chỉ truy cập Customer Store:** Mở trình duyệt và truy cập `http://localhost:3002/`
- **Kết quả mong đợi:** Giao diện React hiển thị và thực thi các sự kiện tải trang bình thường.

---

## Phần 3: Tối ưu hóa bằng Docker Compose

Việc chạy từng dòng lệnh khởi động container cho từng dịch vụ sẽ tốn nhiều thời gian. **Docker Compose** giúp quản lý và định nghĩa cấu trúc của cả 3 services trong duy nhất một tệp tin cấu hình.

Tạo tệp `docker-compose.yml` tại thư mục gốc dự án:
```yaml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "3000:3000"
    env_file:
      - ./server/.env
    volumes:
      - ./server:/app
      - /app/node_modules

  client-admin:
    build: ./client-admin
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
    stdin_open: true
    tty: true
    extra_hosts:
      - "localhost:host-gateway"
    volumes:
      - ./client-admin:/app
      - /app/node_modules
    depends_on:
      - server

  client-customer:
    build: ./client-customer
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
    stdin_open: true
    tty: true
    extra_hosts:
      - "localhost:host-gateway"
    volumes:
      - ./client-customer:/app
      - /app/node_modules
    depends_on:
      - server
```

### Giải thích các thuộc tính trong `docker-compose.yml`:
- `build`: Đường dẫn tương đối trỏ tới thư mục chứa `Dockerfile` của từng service để build tự động.
- `ports`: Định nghĩa ánh xạ cổng tương tự `-p` của dòng lệnh Docker CLI.
- `env_file`: Liên kết và nạp trực tiếp các biến cấu hình từ tệp cấu hình môi trường `.env`.
- `volumes`: Liên kết thư mục dự án trên máy thật với thư mục `/app` trong Container (trừ `node_modules`). Giúp đồng bộ hóa tức thì các sửa đổi của mã nguồn (Hot-reloading) mà không cần build lại Image.
- `depends_on`: Đảm bảo thứ tự khởi động dịch vụ. Server API cần được khởi động trước tiên, sau đó mới đến các giao diện React client.
- `stdin_open` & `tty`: Cần thiết đối với một số phiên bản React-Scripts để giữ container React không bị tự động thoát sau khi khởi động.
- `extra_hosts`: Định nghĩa ánh xạ IP nội bộ. Sử dụng `"localhost:host-gateway"` giúp định tuyến yêu cầu proxy API gửi tới `localhost:3000` (được cấu hình trong `package.json` proxy của React) từ container React chuyển tiếp qua máy thật đến container `server` đang lắng nghe cổng 3000. Điều này giải quyết triệt để lỗi kết nối mạng loopback của các container riêng lẻ.

---

## Nguyên lý tương tác & Mạng nội bộ trong Docker Compose

Khi bạn sử dụng Docker Compose, một mạng ảo nội bộ (**Default Bridge Network**) sẽ tự động được khởi tạo để kết nối tất cả các container thuộc dự án lại với nhau.

### Cơ chế phân giải tên dịch vụ (Service Discovery via DNS)
Bên trong mạng Docker ảo, Docker tích hợp sẵn một DNS server. Các container có thể giao tiếp trực tiếp với nhau thông qua tên dịch vụ (**Service Name**) khai báo trong tệp `docker-compose.yml` thay vì sử dụng địa chỉ IP động.

*Ví dụ:* 
Trong tệp cấu hình Proxy hoặc Axios gọi API trên giao diện React, thay vì sử dụng:
`http://localhost:3000/api/admin/...`
Bạn có thể kết nối nội bộ bằng tên dịch vụ của Backend:
`http://server:3000/api/admin/...`

---

## Các câu lệnh quản trị Docker Compose thông dụng

Mở Terminal tại thư mục gốc chứa tệp `docker-compose.yml` để thực hiện:

- **Khởi chạy và Build toàn bộ ứng dụng:**
  ```bash
  docker compose up --build
  ```
  *(Thêm tham số `-d` ở cuối nếu muốn chạy ngầm).*

- **Dừng và dọn dẹp các container đang chạy:**
  ```bash
  docker compose down
  ```

- **Xem trực tiếp nhật ký hoạt động (Logs) của các Container:**
  ```bash
  docker compose logs -f
  ```
