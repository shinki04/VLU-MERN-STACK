# MERN Stack - Shopping Online

<div align="center">
  <img src="docs/public/images/mern-logo-light.png" alt="MERN Stack Logo" width="200" style="margin-bottom: 20px;" />
  <p>
    <strong>Dự án Mua sắm Trực tuyến MERN Stack kèm theo tài liệu hướng dẫn bài Lab chi tiết (Vitepress)</strong>
  </p>
  <p>
    <a href="#tiếng-việt">Tiếng Việt</a> | 
    <a href="#english">English</a>
  </p>
</div>

---

# Tiếng Việt

## Giới thiệu
Đây là dự án cá nhân được xây dựng trên nền tảng MERN Stack (MongoDB, Express, React, Node.js), lấy cảm hứng từ học phần Lập trình Web của trường **Đại học Văn Lang (VLU)**. Dự án đi kèm tài liệu hướng dẫn thực hành lab chi tiết từ **Lab 01 đến Lab 09** bằng giao diện Vitepress trực quan.

Nếu bạn muốn đóng góp cải thiện dự án, vui lòng tạo **Pull Request (PR)**. Mọi đóng góp đều rất đáng trân trọng!

---

## Cấu trúc dự án
Dự án được tổ chức thành 4 phân hệ chính:
- **`server/`**: API Backend (Node.js/Express) chịu trách nhiệm xác thực JWT, kết nối dữ liệu MongoDB và gửi email.
- **`client-admin/`**: Giao diện Quản trị viên (React) dùng để quản lý danh mục, sản phẩm, đơn hàng và khách hàng.
- **`client-customer/`**: Giao diện Khách hàng (React) hỗ trợ đăng ký/đăng nhập, mua hàng, giỏ hàng, đặt hàng và cập nhật hồ sơ.
- **`docs/`**: Máy chủ tài liệu (Vitepress) chứa toàn bộ hướng dẫn lab song ngữ.

---

## Công nghệ sử dụng
- **Frontend:** React.js (Sử dụng Class Components theo chuẩn chương trình học của trường), Axios, Vanilla CSS, React Router DOM.
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), Nodemailer (Cấu hình SMTP Gmail).
- **Database:** MongoDB Atlas & Mongoose.
- **Quản lý gói:** `pnpm` (Khuyến nghị để tối ưu hóa ổ đĩa) hoặc `npm` / `yarn`.

---

## Hướng dẫn cài đặt & Khởi chạy

### 1. Cấu hình biến môi trường
Tạo tệp `.env` trong thư mục `server/` dựa theo tệp [server/.env.example](./server/.env.example):
```text
DB_SERVER=<your_mongodb_cluster_url>
DB_USER=<your_database_username>
DB_PASS=<your_database_password>
DB_DATABASE=shoppingonline
EMAIL_USER=<your_gmail_address>
EMAIL_PASS=<your_google_app_password>
JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES=86400000
```
*(Lưu ý: Mật khẩu có ký tự đặc biệt cần được mã hóa URL trước khi điền).*

### 2. Khởi chạy Server Backend
```bash
cd server
pnpm install
pnpm dev
```

### 3. Khởi chạy Client Admin (Quản trị viên)
```bash
cd client-admin
pnpm install
pnpm start
```

### 4. Khởi chạy Client Customer (Khách hàng)
```bash
cd client-customer
pnpm install
pnpm start
```

### 5. Khởi chạy trang Tài liệu Lab (Vitepress)
```bash
cd docs
pnpm install
pnpm docs:dev
```

---

## Lưu ý quan trọng
- **Bảo mật file `.env`**: Tệp `.env` chứa các thông tin kết nối và mật khẩu nhạy cảm, đã được cấu hình trong `.gitignore` để tránh đẩy lên GitHub.
- **Legacy React Code**: Dự án sử dụng Class Components thay vì Functional Components & Hooks để bám sát giáo trình học của trường Đại học Văn Lang.
- **Nodemailer SMTP**: Đã nâng cấp cấu hình Email sử dụng Gmail SMTP (`host: smtp.gmail.com`, `port: 587`, `secure: false`) cùng mật khẩu ứng dụng (App Password) thay cho giao thức cũ của Hotmail.

---
---

# English

## Introduction
This is a personal MERN Stack (MongoDB, Express, React, Node.js) shopping application, inspired by the Web Development course at **Van Lang University (VLU)**. It includes complete bilingual lab tutorial instructions from **Lab 01 to Lab 09** powered by Vitepress.

If you would like to contribute and improve this project, please feel free to open a **Pull Request (PR)**. Your contributions are highly appreciated!

---

## Project Structure
The repository is split into 4 main modules:
- **`server/`**: Backend API (Node.js/Express) handling JWT authentication, MongoDB data transactions, and active emails.
- **`client-admin/`**: React-based Admin Panel interface to manage categories, products, orders, and customers.
- **`client-customer/`**: React-based Customer storefront interface supporting shopping cart, checkout, activation, and profile updates.
- **`docs/`**: Vitepress documentation server containing all bilingual lab instructions.

---

## Tech Stack
- **Frontend:** React.js (Legacy Class Components to align with the curriculum standards), Axios, Vanilla CSS, React Router DOM.
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), Nodemailer (Gmail SMTP configuration).
- **Database:** MongoDB Atlas & Mongoose.
- **Package Manager:** `pnpm` (Recommended for storage optimization), `npm`, or `yarn`.

---

## Installation & Getting Started

### 1. Configure Environment Variables
Create a `.env` file in the `server/` directory using [server/.env.example](./server/.env.example) as reference:
```text
DB_SERVER=<your_mongodb_cluster_url>
DB_USER=<your_database_username>
DB_PASS=<your_database_password>
DB_DATABASE=shoppingonline
EMAIL_USER=<your_gmail_address>
EMAIL_PASS=<your_google_app_password>
JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES=86400000
```
*(Note: If your password contains special characters, they must be URL-encoded).*

### 2. Run Backend Server
```bash
cd server
pnpm install
pnpm dev
```

### 3. Run Client Admin
```bash
cd client-admin
pnpm install
pnpm start
```

### 4. Run Client Customer
```bash
cd client-customer
pnpm install
pnpm start
```

### 5. Run Lab Documentation (Vitepress)
```bash
cd docs
pnpm install
pnpm docs:dev
```

---

## Important Notes
- **Security of `.env`**: The `.env` file is excluded from git tracking via `.gitignore` to prevent leaking credentials.
- **Legacy React Code**: This project uses React Class Components instead of Functional Components & Hooks to match the course syllabus specification.
- **Nodemailer SMTP**: The email service has been updated to use modern Gmail SMTP host (`host: smtp.gmail.com`, `port: 587`, `secure: false`) with Google App Passwords instead of Hotmail.
