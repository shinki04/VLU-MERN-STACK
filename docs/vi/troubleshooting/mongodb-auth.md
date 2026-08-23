# Lỗi MongoDB Authentication Failed

Nếu project của bạn gặp lỗi khi khởi động:

```shell
MongoServerError: bad auth : Authentication failed.
    at Connection.onMessage (<......>)
    ...
```

Lỗi này xảy ra khi MongoDB server từ chối thông tin đăng nhập (Username hoặc Password) được truyền vào chuỗi kết nối (connection string).

---

## Nguyên nhân thường gặp

1. **Sai mật khẩu hoặc tài khoản:** Mật khẩu hoặc tên tài khoản MongoDB Atlas được cấu hình trong file `.env` không trùng khớp với tài khoản Database User đã tạo trên trang MongoDB Atlas.
2. **Mật khẩu chứa ký tự đặc biệt:** Đây là nguyên nhân phổ biến nhất. Nếu mật khẩu của bạn có các ký tự đặc biệt như `@`, `:`, `/`, `+`, `?`, `#`, `&`... thì khi nối chuỗi kết nối:
   ```js
   const uri = `mongodb+srv://${MyConstants.DB_USER}:${MyConstants.DB_PASS}@${MyConstants.DB_SERVER}/${MyConstants.DB_DATABASE}`;
   ```
   Trình phân tích cú pháp URL sẽ hiểu sai cấu trúc và dẫn đến lỗi xác thực hoặc lỗi phân tích cú pháp.
3. **Chưa khởi động lại Server Node.js:** Bạn đã sửa lại file `.env` nhưng chưa khởi động lại server, nên ứng dụng vẫn dùng thông tin cấu hình cũ bị sai.

---

## Cách khắc phục

### 1. Kiểm tra lại Database User trên MongoDB Atlas

Đảm bảo bạn đã tạo tài khoản **Database User** (không phải tài khoản đăng nhập trang web MongoDB Atlas) và cấp quyền đầy đủ:

- Vào MongoDB Atlas -> **Database Access** dưới mục Security.
- Đảm bảo có User có tên khớp với `DB_USER` trong `.env`.
- User đó phải có quyền **Read and write to any database** (hoặc ít nhất là quyền đọc/ghi trên database cụ thể của bạn).

### 2. URL-encode mật khẩu nếu chứa ký tự đặc biệt

Nếu mật khẩu của bạn chứa các ký tự đặc biệt, bạn cần chuyển đổi chúng sang dạng mã hóa URL (URL-encoded).

**Bảng chuyển đổi các ký tự phổ biến:**
| Ký tự | Mã hóa URL |
| :---: | :---: |
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `+` | `%2B` |
| `?` | `%3F` |
| `#` | `%23` |
| `&` | `%26` |

_Ví dụ:_ Nếu mật khẩu của bạn là `my@pass:123`, hãy sửa trong file `.env` thành:

```text
DB_PASS=my%40pass%3A123
```

> **Mẹo:** Bạn cũng có thể tạo một Database User mới trên MongoDB Atlas với mật khẩu chỉ chứa chữ cái và số (không có ký tự đặc biệt) để tránh việc phải mã hóa thủ công này.

### 3. Khởi động lại Server Node.js

Sau khi sửa đổi file `.env`, hãy tắt server đang chạy bằng tổ hợp phím `Ctrl + C` và chạy lại:

```bash
pnpm dev
# hoặc
npm run dev
```
