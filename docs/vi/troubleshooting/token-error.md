# Lỗi Xác thực Token (Auth Token Errors)

Khi làm việc với các API yêu cầu quyền đăng nhập (các API trong nhóm Admin hoặc Customer cần bảo mật), bạn có thể gặp các thông báo lỗi liên quan đến JWT (JSON Web Token) từ máy chủ như:

- `"Auth token is not supplied"` (Không tìm thấy token xác thực)
- `"Token is not valid"` (Token không hợp lệ hoặc đã hết hạn)

Dưới đây là nguyên nhân và hướng dẫn cách khắc phục chi tiết cho từng trường hợp.

---

## 1. Lỗi: "Auth token is not supplied"

### Nguyên nhân

Lỗi này xảy ra khi endpoint API yêu cầu mã xác thực JWT trong headers để kiểm tra quyền truy cập nhưng request của bạn hoàn toàn không gửi kèm token này.

Trong file `server/utils/JwtUtil.js`, middleware `checkToken` tìm kiếm token từ header `x-access-token` hoặc `authorization`:

```javascript
let token = req.headers["x-access-token"] || req.headers["authorization"];
```

Nếu không tìm thấy, server sẽ trả về phản hồi:

```json
{
  "success": false,
  "message": "Auth token is not supplied"
}
```

### Cách khắc phục

#### A. Khi kiểm tra bằng Postman:

Đảm bảo bạn đã thêm header xác thực trong tab **Headers** của Postman (không phải tab _Params_ hay _Body_):

- **Key:** `x-access-token`
- **Value:** `<token_nhận_được_sau_khi_đăng_nhập>`
  _(Ví dụ: sao chép toàn bộ chuỗi token dài từ kết quả trả về của API Đăng nhập và dán vào)_

Hoặc nếu sử dụng header `Authorization`:

- **Key:** `Authorization`
- **Value:** `Bearer <token>`

##### Ví dụ lấy và sử dụng `<admin-token>` qua Postman:

1. **Bước 1: Thực hiện đăng nhập để lấy token:**
   - Tạo một request mới trong Postman:
     - **Method:** `POST`
     - **URL:** `http://localhost:3000/api/admin/login`
     - **Body** -> Chọn `raw` -> Chọn định dạng `JSON`:
       ```json
       {
         "username": "admin",
         "password": "123"
       }
       ```
     - Nhấn **Send**. Phản hồi trả về từ server sẽ có cấu trúc như sau:
       ```json
       {
         "success": true,
         "message": "Authentication successful",
         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjMiLCJpYXQiOjE3ODc0ODE2MDcsImV4cCI6MTc4NzU2ODAwN30.AG3n4IJPSN5FVvZc5JUCAOurwSqPsVvcrhqynpl3tKA"
       }
       ```
     - **Sao chép (Copy)** toàn bộ chuỗi ký tự nằm trong trường `"token"`.

2. **Bước 2: Sử dụng token để gọi các API bảo mật:**
   - Tạo request gọi API cần kiểm tra (ví dụ: lấy danh sách danh mục `GET http://localhost:3000/api/admin/categories`):
     - Mở tab **Headers** của request đó.
     - Thêm dòng cấu hình mới:
       - **Key:** `x-access-token`
     - Nhấn **Send** để thực hiện gọi API.

::: warning LƯU Ý VỀ PHÂN QUYỀN TÀI KHOẢN (ADMIN vs CUSTOMER)
- Các endpoint API dành cho **Admin** (bắt đầu bằng `/api/admin/...`) yêu cầu token được tạo từ tài khoản Admin (đăng nhập qua `/api/admin/login`).
- Các endpoint API dành cho **Customer** (bắt đầu bằng `/api/customer/...`) yêu cầu token được tạo từ tài khoản Customer (đăng nhập qua `/api/customer/login`).
- Đảm bảo rằng bạn sử dụng đúng loại tài khoản và token tương ứng khi kiểm tra API trên Postman. Việc dùng sai loại token (ví dụ: dùng token của Customer để truy cập API của Admin) sẽ dẫn đến lỗi phân quyền hoặc không thể thực thi đúng nghiệp vụ mong muốn.
:::

#### B. Trong code Client (React):

Kiểm tra xem các yêu cầu gọi API của bạn đã đính kèm token trong cấu hình `headers` của Axios chưa:

```javascript
const config = { headers: { "x-access-token": this.context.token } };
axios.get("/api/admin/categories", config);
```

Nếu `this.context.token` đang rỗng (do chưa đăng nhập thành công hoặc state bị xóa sạch sau khi tải lại trang), server sẽ báo lỗi này. Hãy chắc chắn rằng trạng thái đăng nhập đã được quản lý và lưu giữ chính xác.

---

## 2. Lỗi: "Token is not valid"

### Nguyên nhân

Lỗi này xảy ra khi server nhận được token từ request nhưng quá trình giải mã (verify) bằng khóa bí mật thất bại. Các nguyên nhân chính bao gồm:

1. **Token đã hết hạn:** Thời gian sống của token đã vượt quá giới hạn cấu hình trong `JWT_EXPIRES` (ví dụ: token tự động hết hiệu lực sau 1 ngày hoặc vài giờ).
2. **Khóa bí mật không khớp (JWT Secret mismatch):** Khóa `JWT_SECRET` trên server đã bị thay đổi hoặc do server restart sinh ra khóa ngẫu nhiên mới, làm các token cũ được tạo ra trước đó không còn hợp lệ.
3. **Token bị sai định dạng:** Token bị sao chép thiếu ký tự, dư khoảng trắng hoặc bị chỉnh sửa thủ công.

### Cách khắc phục

#### A. Đăng nhập lại (Re-login) để lấy Token mới:

Vì token có thể đã hết hạn, cách đơn giản nhất là đăng nhập lại thông qua giao diện hoặc gọi lại API Login để nhận token mới.

#### B. Kiểm tra cấu hình `JWT_SECRET` và `.env`:

Đảm bảo rằng biến môi trường `JWT_SECRET` và `JWT_EXPIRES` được cấu hình nhất quán và không bị thay đổi bất ngờ.
Trong file `.env` ở thư mục `server`:

```text
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=86400000 # Ví dụ: 24h tính bằng milliseconds
```

> **Lưu ý:** Hãy luôn khởi động lại server Node.js sau khi chỉnh sửa file `.env` để áp dụng cấu hình mới.

#### C. Xử lý lỗi tự động ở phía Client:

Nếu token hết hạn hoặc không hợp lệ, bạn nên bổ sung cơ chế bắt lỗi ở phía Client để tự động đăng xuất người dùng và chuyển hướng họ về trang đăng nhập nhằm tránh lỗi crash ứng dụng khi render dữ liệu.

Ví dụ kiểm tra kết quả trả về trong React:

```javascript
axios.get("/api/admin/categories", config).then((res) => {
  const result = res.data;
  if (
    result.success === false &&
    (result.message === "Token is not valid" ||
      result.message === "Auth token is not supplied")
  ) {
    // Reset token và thông báo đăng nhập lại
    this.context.setToken("");
    this.context.setUsername("");
    alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
  } else {
    this.setState({ categories: result });
  }
});
```
