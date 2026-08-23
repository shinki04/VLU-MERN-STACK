# Lab 01: MERN Stack - Mua Sắm Trực Tuyến (Chuẩn bị & Cài đặt)

:::warning LƯU Ý
Để đảm bảo toàn bộ series bài lab hoạt động ổn định, vui lòng khởi động các chương trình theo đúng thứ tự sau:

Server `(port: 3000)` → Client Admin `(port: 3001)` → Client Customer `(port: 3002)`
:::

## Chuẩn bị

### MongoDB Atlas
- Đăng ký tài khoản trên MongoDB Atlas: [https://www.mongodb.com/atlas/database](https://www.mongodb.com/atlas/database)
- **Tạo Project & Database:**
  - Menu **Projects** => **New Project**
    - Tên dự án (project): `<project_name>`
  - Menu **Database** => **Create a free database**
    - Cloud provider & Region (Nhà cung cấp đám mây & Khu vực): AWS + Singapore
    - Cluster name (Tên cụm): `<cluster>`
    
- **Database Access (Truy cập cơ sở dữ liệu):**
  - Menu **Database Access** => **Create a Database User** (Tạo người dùng)
    - Authentication method (Phương thức xác thực): Username and Password
    - Password authentication (Xác thực mật khẩu): Nhập `<db_user>` và `<db_pass>`. Bạn có thể thay đổi `<db_user>` và `<db_pass>` cho phù hợp với bản thân và dễ nhớ. 
    ::: tip TIP
    Để thuận tiện cho các bước cấu hình và kết nối cơ sở dữ liệu sau này, bạn nên lưu lại **username** và **password** đã tạo.
    :::
     
    - Chọn `Create Database User` để tạo tài khoản quản lý cơ sở dữ liệu
    - Ấn `Choose a connection method` để chọn cách kết nối cơ sở dữ liệu.
    ::: details DETAILS {open}
      Bạn có thể lựa chọn phương thức kết nối phù hợp với mục đích sử dụng:
      - **Driver:** Sử dụng trong môi trường development, phù hợp để 
      kết nối từ backend như Node.js, Go, v.v.
      - **Compass:** Sử dụng khi kết nối thông qua MongoDB Compass.
      - **Shell:** Sử dụng khi muốn kết nối thông qua CLI như CMD hoặc PowerShell.
      - **...:** Các phương thức kết nối khác tùy theo nhu cầu.
    :::
- **Network Access (Truy cập mạng):**
  - Menu **Network Access** => **Add an IP address** (Thêm địa chỉ IP)
    - Access list entry (Mục danh sách truy cập): `0.0.0.0/0` (cho phép truy cập từ bất kỳ đâu).
    ::: warning WARNING
      `0.0.0.0/0` cho phép truy cập từ bất kỳ địa chỉ IP nào. Cấu hình này chỉ được sử dụng trong phạm vi bài lab để thuận tiện cho việc thực hành.
      Không sử dụng cấu hình này trong môi trường thực tế.
    :::

- **MongoDB Compass:**
  ::: details DETAILS {open}
    MongoDB Compass là công cụ tùy chọn. Nếu thiết bị có hạn chế về tài nguyên, bạn có thể bỏ qua bước này và thực hiện các thao tác với MongoDB thông qua MongoDB Atlas trực tiếp trên website.
  :::
  - Tải xuống và cài đặt MongoDB Compass (Giao diện đồ họa - GUI) từ: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
  - Tạo kết nối mới (New connection) và sao chép chuỗi kết nối (connection string):
    `mongodb+srv://<db_user>:<db_pass>@<cluster>.mongodb.net/test`
  ::: details DETAILS
  Nếu bạn muốn tìm hiểu thêm về cách kết nối MongoDB Atlas với MongoDB Compass bằng **connection string**, có thể tham khảo [hướng dẫn chi tiết tại GeeksforGeeks](https://www.geeksforgeeks.org/mongodb/connect-mongodb-atlas-cluster-with-mongodb-compass/).
  :::
  - Tạo cơ sở dữ liệu: `shoppingonline`
    - Tạo collection: `admins` => Import file JSON từ [admins.json](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/admins.json)
    - Tạo collection: `categories` => Import file JSON từ [categories.json](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/categories.json)
    - Tạo collection: `products` => Import file JSON từ [products.json](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/products.json)

### Hotmail
  ::: warning WARNING
  Bạn có thể sử dụng gmail để thay thế bởi vì hotmail đã bị Microsoft ngừng hỗ trợ. Nếu gặp lỗi, hãy xem [Các lỗi thường gặp khi cấu hình Email](/vi/troubleshooting/hotmail).

  :::
- Đăng ký tài khoản từ Microsoft: [https://signup.live.com](https://signup.live.com)
  - Email mới: `<email_user>@hotmail.com`
  - Tạo mật khẩu: `<email_pass>`
- Tab Security (Bảo mật): tắt tính năng xác minh hai bước (two-step verification).
- Ứng dụng Outlook: xem email chào mừng (welcome email).
- Cài đặt SMTP (SMTP settings) từ: [Microsoft Support](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398)
  - Máy chủ (Server): `smtp.office365.com`
  - Cổng (Port): `587`
  - Mã hóa (Encryption): `STARTTLS`
- Kiểm tra máy chủ SMTP bằng terminal:
  ```bash
  $ telnet smtp.office365.com 587
  ```

---

## MERN Stack

### Cài đặt

#### Các công cụ cần thiết

##### NodeJS
- Kiểm tra phiên bản:
  ```bash
  $ node --version
  $ npm --version
  ```
- Nếu chưa có, hãy tải xuống và cài đặt NodeJS từ: [https://nodejs.org/en/download](https://nodejs.org/en/download)

- Sau khi cài đặt hoàn tất, hãy kiểm tra lại phiên bản:
  ```bash
  $ node --version
  $ npm --version
  ```

##### Công cụ Nodemon
- Cài đặt công cụ Nodemon trên toàn hệ thống (sử dụng lệnh `sudo` đối với MacOS):
  ```bash
  $ npm install nodemon --global
  $ nodemon --version
  ```

##### ReactJS
- Cài đặt công cụ `create-react-app` trên toàn hệ thống (sử dụng lệnh `sudo` đối với MacOS):
  ```bash
  $ npm install create-react-app --global
  $ create-react-app --version
  ```

##### Visual Studio Code IDE
- Tải xuống và cài đặt Visual Studio Code từ: [https://code.visualstudio.com/download](https://code.visualstudio.com/download)

#### Cấu trúc Projects

Cấu trúc thư mục dự án **<u>(chỉ xem, sẽ hướng dẫn tạo thư mục ở các bước sau)</u>**:

```text
|-- projectname
    |-- server
    |-- client-admin
    |-- client-customer
```

##### Project Server
- Tạo project server:

<div class="cmd-server">

  ```bash
  npm init -y
  ```

</div>

- Tải thư viện cần thiết:

<div class="cmd-server">

  ```bash
  $ npm install express body-parser --save
  ```

</div>

Sau khi tải thành công, file `server/package.json` sẽ cập nhật `devDependencies` và hiển thị 2 thư viện kèm version mà bạn vừa tải.

- Tạo file `server/index.js`:

  ```javascript
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
  // middlewares
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  // apis
  app.get('/hello', (req, res) => {
    res.json({ message: 'Hello from server!' });
  });
  ```

- Khởi chạy server:
<div class="cmd-server">

  ```bash
  nodemon index.js
  ```
</div>

- Kiểm tra với Postman: (GET) `http://localhost:3000/hello`

Kết quả phản hồi:
```json
{
  "message": "Hello from server!"
}
```

##### Project Client-admin
- Tạo project client-admin:
<div class="project-name">

  ```bash
  npx create-react-app client-admin
  ```
  </div>



- Cập nhật file `client-admin/package.json`:
  ```json
  {
    ...
    "homepage": "/admin",
    "proxy": "http://localhost:3000"
  }
  ```

- Tải thư viện cần thiết:
<div class="client-admin">

```bash
npm install axios --save
```

</div>

- Cập nhật file `client-admin/src/App.js`:
  ```javascript
  // CLI: npm install axios --save
  import axios from 'axios';
  import React, { Component } from 'react';

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        message: 'Loading...'
      };
    }
    render() {
      return (
        <div>
          <h2>Admin page</h2>
          <p>{this.state.message}</p>
        </div>
      );
    }
    componentDidMount() {
      axios.get('/hello').then((res) => {
        const result = res.data;
        this.setState({ message: result.message });
      });
    }
  }
  export default App;
  ```
- Khởi chạy client-admin:

<div class="client-admin">

  ```bash
  npm start
  ```

</div>

- Kiểm tra trên trình duyệt: `http://localhost:3001/admin`

##### Project Client-customer
- Tạo project client-customer:

<div class="project-name">


  ```bash
  npx create-react-app client-customer
  ```
  </div>

- Cập nhật file `client-customer/package.json`:
  ```json
  {
    ...
    "homepage": "/",
    "proxy": "http://localhost:3000"
  }
  ```

- Tải thư viện cần thiết:
<div class="client-customer">

```bash
npm install axios --save
```

</div>

- Cập nhật file `client-customer/src/App.js`:
  ```javascript
  // CLI: npm install axios --save
  import axios from 'axios';
  import React, { Component } from 'react';

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        message: 'Loading...'
      };
    }
    render() {
      return (
        <div>
          <h2>Customer page</h2>
          <p>{this.state.message}</p>
        </div>
      );
    }
    componentDidMount() {
      axios.get('/hello').then((res) => {
        const result = res.data;
        this.setState({ message: result.message });
      });
    }
  }
  export default App;
  ```
- Khởi chạy client-customer:
<div class="client-customer">

  ```bash
  npm start
  ```
  </div>

- Kiểm tra trên trình duyệt: `http://localhost:3002`
