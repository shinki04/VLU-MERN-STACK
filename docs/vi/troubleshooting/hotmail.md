# Lỗi Hotmail

Bạn có thể sử dụng Gmail để thay thế bởi vì Hotmail đã bị Microsoft ngừng hỗ trợ cho xác thực cơ bản (SMTP).

Đọc thêm tại đây: 
- [Nodemailer Issue #1685](https://github.com/nodemailer/nodemailer/issues/1685)
- [Nodemailer Issue #1485](https://github.com/nodemailer/nodemailer/issues/1485)
:::tip TIP 
  Ngoài gmail, bạn có thể sử dụng các nền tảng SMTP khác như: Mailtrap, Brevo, ... 
:::

:::details XEM THÊM {open}
  Bạn có thể xem hướng dẫn về cách cấu hình gmail để sử dụng cho Nodemailder [tại đây](https://www.youtube.com/watch?v=cqdAS49RthQ)
::: 
## Cấu hình Gmail


1. Đăng nhập vào tài khoản Gmail bạn muốn sử dụng để gửi email.

2. Mở trang [Tài khoản Google (Google Account)](https://myaccount.google.com/).

3. Chọn mục **Bảo mật (Security)**.

4. Cuộn xuống phần **Cách bạn đăng nhập vào Google (How you sign in to Google)**.

5. Tìm mục **Xác minh 2 bước (Two-Step Verification)**.

6. Nhấn vào **Xác minh 2 bước → Bật (Turn on)**.

7. Google sẽ yêu cầu bạn xác nhận tài khoản và thiết lập phương thức xác minh. [Google Support](https://support.google.com/accounts/answer/185839?hl=vi)

Sau khi bật thành công, đừng dừng lại ở đó. Vì mục tiêu của chúng ta là sửa lỗi Nodemailer, bước tiếp theo là tạo **App Password**.

Bạn có thể mở thẳng trang này: [App Password của Google](https://myaccount.google.com/apppasswords)

## Cấu hình App Password

### Mở trang App Password

Đăng nhập đúng tài khoản Gmail mà bạn muốn sử dụng để gửi email, sau đó mở: [App Password của Google](https://myaccount.google.com/apppasswords)

Nếu Google yêu cầu bạn đăng nhập lại, cứ đăng nhập.

> **Lưu ý:** Bạn phải bật Xác minh 2 bước trước thì tính năng App Password mới có thể được sử dụng. Google giải thích rằng App Password là một mã gồm 16 ký tự dùng cho các ứng dụng không hỗ trợ các phương thức đăng nhập hiện đại.

## Tạo App Password

Tại trang **App Password**, tìm đến phần tạo mật khẩu mới.

Nếu xuất hiện trường **Tên ứng dụng (App Name)**, hãy nhập một tên bất kỳ:

```text
my-rest-api
```
Sau đó nhấp vào Tạo (Create).

Google sẽ cung cấp cho bạn một App Password gồm 16 ký tự:
```text
abcd efgh ijkl mnop
```
:::warning Lưu ý

Đây chỉ là mã ví dụ. Không sử dụng mã trên.

Bạn phải sử dụng App Password thực tế được Google tạo cho tài khoản của bạn.

:::
## Thêm App Password vào cấu hình của bạn

Có 2 cách để cấu hình Mật khẩu Ứng dụng vào file `.env` của bạn:

::: code-group

```text [Cách 1: Xóa khoảng trắng]
PORT=3000
EMAIL=địa_chỉ_gmail_của_bạn
EMAIL_PASSWORD=mật_khẩu_ứng_dụng_viết_liền
```

```text [Cách 2: Dùng ngoặc kép]
PORT=3000
EMAIL=địa_chỉ_gmail_của_bạn
EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

:::

- **Cách 1 (Xóa khoảng trắng):** Nếu Google cấp mã `abcd efgh ijkl mnop`, bạn phải tự xóa khoảng trắng và nhập `abcdefghijklmnop`.
- **Cách 2 (Dùng ngoặc kép):** Bạn đặt toàn bộ mật khẩu vào trong cặp dấu ngoặc kép `" "`. Bộ phân tích `.env` sẽ tự hiểu khoảng trắng là một phần của mật khẩu. Đừng xóa thủ công khoảng trắng trong code NodeJS, vì NodeJS sẽ đọc chuỗi trích dẫn chính xác như Google đã tạo.

## Cập nhật code cấu hình
Nhớ cập nhật `service` thành `"gmail"` ở file `server/utils/EmailUtil.js`. Hầu hết mọi người đồng ý rằng cấu hình phổ biến là thiết lập `secure: true` với cổng `465` hoặc `secure: false` với cổng `587`.
Ví dụ:
```js
const transporter = nodemailer.createTransport({
  service: "hotmail",// [!code --]
  service: "gmail", // [!code ++]
  // port: 587, // [!code ++]
  // secure: false, // [!code ++]
  auth: {
    user: process.env.EMAIL || MyConstants.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || MyConstants.EMAIL_PASS,
  },
});
```

## Kiểm tra .gitignore
Đảm bảo bạn đã làm đúng:
```text
node_modules/
.env
```
Điều này rất quan trọng vì env không được phép tải lên GitHub vì nó chứa nhiều thông tin nhạy cảm bao gồm App Password.

## Khởi động lại Node.js
Các biến môi trường chỉ được tải khi ứng dụng khởi động. Hãy luôn khởi động lại Node.js sau khi thay đổi file `.env` hoặc file mã nguồn.

Nếu terminal đang chạy server, nhấn `Ctrl + C`

Sau đó:
```bash
$ node server.js
```

Nếu thành công, bạn sẽ thấy log:
```text
The server is running at http://localhost:3000
SMTP server is ready.
```