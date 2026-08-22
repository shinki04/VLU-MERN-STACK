---
layout: home

hero:
  name: "MERN Stack"
  text: "Mua Sắm Trực Tuyến"
  tagline: "Hướng dẫn xây dựng ứng dụng thương mại điện tử full-stack sử dụng MongoDB, Express, React và Node.js."
  image:
    src: /images/mern-logo-light.png
    alt: MERN Stack Logo
    dark: /images/mern-logo-dark.png
  actions:
    - theme: brand
      text: Bắt đầu (Lab 1)
      link: /vi/labs/lab1
    - theme: alt
      text: Xem mã nguồn
      link: https://github.com/shinki04/VLU-MERN-STACK
---

## Lời mở đầu

Đây là dự án cá nhân được phát triển dựa trên ý tưởng từ môn học Lập trình Web của trường Đại học Văn Lang (VLU). Nếu bạn muốn đóng góp để cải thiện dự án, vui lòng tạo **Pull Request (PR)**, tôi rất trân trọng mọi sự hỗ trợ và đóng góp của bạn!

### Một số lưu ý quan trọng

- **Bảo mật môi trường (.env):** Tôi cấu hình và sử dụng file `.env` riêng biệt, khác với hướng dẫn trong bài Lab để đảm bảo an toàn thông tin nhạy cảm.
- **Phiên bản React cũ:** Dự án sử dụng mã nguồn React phiên bản khá cũ (sử dụng Class Component thay vì Functional Component và Hooks) theo đúng tài liệu môn học của trường.
- **Các lệnh Scripts tiện lợi:** Các câu lệnh script đã được bổ sung đầy đủ trong file `server/package.json` giúp bạn dễ dàng chạy dự án bằng `pnpm dev` / `npm run dev` hoặc `pnpm start` / `npm start`.
- **Tải nodemon cục bộ (Local Dependency):** Ở phần server, tôi đã cài đặt `nodemon` trực tiếp dưới dạng dependency cục bộ của dự án thay vì cài đặt toàn cục (`-g`) để tối ưu hóa bộ nhớ thiết bị.
- **Sử dụng pnpm:** Dự án hiện đang sử dụng trình quản lý gói `pnpm` để tối ưu hóa thời gian tải và dung lượng ổ đĩa. Tuy nhiên, bạn hoàn toàn có thể tiếp tục sử dụng `npm` theo hướng dẫn của bài Lab bình thường.
