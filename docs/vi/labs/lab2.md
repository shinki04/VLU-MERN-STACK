# Lab 02: MERN Stack - Mua Sắm Trực Tuyến (Admin Đăng nhập & Đăng xuất)

## MERN Stack

### Models (Mô hình)
Tạo file `server/models/Models.js`:
<div class="cmd-server">

```bash
$ npm install mongoose --save
``` 

</div>

```javascript
const mongoose = require('mongoose');

// schemas
const AdminSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String
}, { versionKey: false });

const CategorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String
}, { versionKey: false });

const CustomerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  name: String,
  phone: String,
  email: String,
  active: Number,
  token: String,
}, { versionKey: false });

const ProductSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  image: String,
  cdate: Number,
  category: CategorySchema
}, { versionKey: false });

const ItemSchema = mongoose.Schema({
  product: ProductSchema,
  quantity: Number
}, { versionKey: false, _id: false });

const OrderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  cdate: Number,
  total: Number,
  status: String,
  customer: CustomerSchema,
  items: [ItemSchema]
}, { versionKey: false });

// models
const Admin = mongoose.model('Admin', AdminSchema);
const Category = mongoose.model('Category', CategorySchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

module.exports = { Admin, Category, Customer, Product, Order };
```

### Utils (Tiện ích)
Tạo file `server/utils/MyConstants.js`:
```javascript
const MyConstants = {
  DB_SERVER: '<cluster>.mongodb.net',
  DB_USER: '<db_user>',
  DB_PASS: '<db_pass>',
  DB_DATABASE: '<db_name>',
  EMAIL_USER: '<email_user>', // Dịch vụ mail của Microsoft
  EMAIL_PASS: '<email_pass>',
  JWT_SECRET: '<jwt_secret>',
  JWT_EXPIRES: '<jwt_expires>', // tính bằng mili giây
};
module.exports = MyConstants;
```
::: warning WARNING
- Không nên lưu trực tiếp các thông tin nhạy cảm như tài khoản, mật khẩu, JWT Secret hoặc thông tin kết nối cơ sở dữ liệu trong mã nguồn.
- Vui lòng lưu các giá trị này trong file .env và đảm bảo file .env đã được thêm vào .gitignore để tránh vô tình đẩy thông tin bảo mật lên GitHub hoặc các hệ thống quản lý mã nguồn khác.
:::

Tạo file `server/utils/MongooseUtil.js`:
Cài đặt thư viện `mongoose`:
<div class="cmd-server">

```bash
$ npm install mongoose --save
```

</div>

```javascript
const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');

const uri = 'mongodb+srv://' + MyConstants.DB_USER + ':' + MyConstants.DB_PASS + '@' + MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE;

mongoose.connect(uri, { useNewUrlParser: true })
  .then(() => { console.log('Connected to ' + MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE); })
  .catch((err) => { console.error(err); });
```

Tạo file `server/utils/CryptoUtil.js`:
Cài đặt thư viện `crypto`:
<div class="cmd-server">

```bash
$ npm install crypto --save
```

</div>

```javascript
const CryptoUtil = {
  md5(input) {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(input).digest('hex');
    return hash;
  }
};
module.exports = CryptoUtil;
```

Tạo file `server/utils/EmailUtil.js`:
Cài đặt thư viện `nodemailer`:
<div class="cmd-server">

```bash
$ npm install nodemailer --save
```

</div>

  ::: warning WARNING
  Bạn có thể sử dụng gmail để thay thế bởi vì hotmail đã bị Microsoft ngừng hỗ trợ. Nếu gặp lỗi, hãy xem [Các lỗi thường gặp khi cấu hình Email](/vi/troubleshooting/hotmail.md).

  :::
  
```javascript
const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS
  }
});

const EmailUtil = {
  send(email, id, token) {
    const text = 'Cảm ơn bạn đã đăng ký, vui lòng nhập thông tin sau để kích hoạt tài khoản của bạn:\n\t .id: ' + id + '\n\t .token: ' + token;
    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'Đăng ký | Xác thực',
        text: text
      };
      transporter.sendMail(mailOptions, function (err, result) {
        if (err) reject(err);
        resolve(true);
      });
    });
  }
};
module.exports = EmailUtil;
```

Tạo file `server/utils/JwtUtil.js`:
Cài đặt thư viện `jsonwebtoken`:
<div class="cmd-server">

```bash
$ npm install jsonwebtoken --save
```

</div>

```javascript
const jwt = require('jsonwebtoken');
const MyConstants = require('./MyConstants');

const JwtUtil = {
  genToken(username, password) {
    const token = jwt.sign(
      { username: username, password: password },
      MyConstants.JWT_SECRET,
      { expiresIn: MyConstants.JWT_EXPIRES }
    );
    return token;
  },
  checkToken(req, res, next) {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
      jwt.verify(token, MyConstants.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Token không hợp lệ'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Không tìm thấy Auth token'
      });
    }
  }
};
module.exports = JwtUtil;
```

### Stylesheets (CSS)
Cập nhật các file CSS `client-admin/src/App.css` và `client-customer/src/App.css` (xem chi tiết code trong mã nguồn).

## Chức năng (Functionals)

### Admin - Đăng nhập & Đăng xuất

#### Server
Tạo file `server/models/AdminDAO.js`:
```javascript
require('../utils/MongooseUtil');
const Models = require('./Models');

const AdminDAO = {
  async selectByUsernameAndPassword(username, password) {
    const query = { username: username, password: password };
    const admin = await Models.Admin.findOne(query);
    return admin;
  }
};
module.exports = AdminDAO;
```

Tạo file `server/api/admin.js`:
```javascript
const express = require('express');
const router = express.Router();
// utils
const JwtUtil = require('../utils/JwtUtil');
// daos
const AdminDAO = require('../models/AdminDAO');

// login
router.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    const admin = await AdminDAO.selectByUsernameAndPassword(username, password);
    if (admin) {
      const token = JwtUtil.genToken();
      res.json({ success: true, message: 'Đăng nhập thành công', token: token });
    } else {
      res.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }
  } else {
    res.json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu' });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token hợp lệ', token: token });
});

module.exports = router;
```

Cập nhật file `server/index.js`:
```javascript
// apis
app.use('/api/admin', require('./api/admin.js'));
```

##### Kiểm tra với Postman
- (POST) `http://localhost:3000/api/admin/login`
  - Body (raw+JSON): 
    ```json
      { 
        "username": "admin", 
        "password": "123" 
      }
    ```
  - Kết quả:

  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjMiLCJpYXQiOjE3ODc0NzkzNjYsImV4cCI6MTc4NzU2NTc2Nn0.xu9dwNQMkc0-sOPNxnKUzFwyqtId2a3YSW72IIBo7UE"
  }
  ```
  ::: warning WARNING
  Nếu kết quả trả về là:

  ```json
  {
    "success": false,
    "message": "Incorrect username or password"
  }
  ```

  Vui lòng kiểm tra lại thông tin tài khoản admin trong database.

  Nếu chưa có dữ liệu admin, bạn có thể thêm lại dữ liệu từ file `admins.json` vào database `shoppingonline` theo hướng dẫn [tại đây](/vi/labs/lab1.md#mongodb-atlas).

  Bạn có thể lấy file `admins.json` [tại đây](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/admins.json).


  :::

- (GET) `http://localhost:3000/api/admin/token`
  - Headers: `"x-access-token": <token>`

  - Kết quả:
    ```json
      {
          "success": true,
          "message": "Token is valid",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjMiLCJpYXQiOjE3ODc0NzkzNjYsImV4cCI6MTc4NzU2NTc2Nn0.xu9dwNQMkc0-sOPNxnKUzFwyqtId2a3YSW72IIBo7UE"
      }
    ```

#### Client-admin

Tạo Context `client-admin/src/contexts/MyContext.js`:
```javascript
import React from 'react';
const MyContext = React.createContext();
export default MyContext;
```

Tạo Provider `client-admin/src/contexts/MyProvider.js`:
```javascript
import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { // global state
      // variables
      token: '',
      username: '',
      // functions
      setToken: this.setToken,
      setUsername: this.setUsername
    };
  }
  setToken = (value) => {
    this.setState({ token: value });
  }
  setUsername = (value) => {
    this.setState({ username: value });
  }
  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}
export default MyProvider;
```

Cập nhật file `client-admin/src/App.js`:
```javascript
import './App.css';
import React, { Component } from 'react';
import MyProvider from './contexts/MyProvider';
import Login from './components/LoginComponent';
import Main from './components/MainComponent';

class App extends Component {
  render() {
    return (
      <MyProvider>
        <Login />
        <Main />
      </MyProvider>
    );
  }
}
export default App;
```

Tạo file `client-admin/src/components/LoginComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Login extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: ''
    };
  }
  render() {
    if (this.context.token === '') {
      return (
        <div className="align-valign-center">
          <h2 className="text-center">ADMIN LOGIN</h2>
          <form>
            <table className="align-center">
              <tbody>
                <tr>
                  <td>Username</td>
                  <td><input type="text" value={this.state.txtUsername} onChange={(e) => { this.setState({ txtUsername: e.target.value }) }} /></td>
                </tr>
                <tr>
                  <td>Password</td>
                  <td><input type="password" value={this.state.txtPassword} onChange={(e) => { this.setState({ txtPassword: e.target.value }) }} /></td>
                </tr>
                <tr>
                  <td></td>
                  <td><input type="submit" value="LOGIN" onClick={(e) => this.btnLoginClick(e)} /></td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      );
    }
    return (<div />);
  }
  
  // event-handlers
  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    if (username && password) {
      const account = { username: username, password: password };
      this.apiLogin(account);
    } else {
      alert('Vui lòng nhập tài khoản và mật khẩu');
    }
  }

  // apis
  apiLogin(account) {
    axios.post('/api/admin/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
      } else {
        alert(result.message);
      }
    });
  }
}
export default Login;
```

Tạo file `client-admin/src/components/MenuComponent.js`:
```javascript
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';

class Menu extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  render() {
    return (
      <div className="border-bottom">
        <div className="float-left">
          <ul className="menu">
            <li className="menu"><Link to='/admin/home'>Home</Link></li>
            <li className="menu"><Link to=''>Category</Link></li>
            <li className="menu"><Link to=''>Product</Link></li>
            <li className="menu"><Link to=''>Order</Link></li>
            <li className="menu"><Link to=''>Customer</Link></li>
          </ul>
        </div>
        <div className="float-right">
          Xin chào <b>{this.context.username}</b> | <Link to='/admin/home' onClick={() => this.lnkLogoutClick()}>Đăng xuất</Link>
        </div>
        <div className="float-clear" />
      </div>
    );
  }
  
  // event-handlers
  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}
export default Menu;
```

Tạo file `client-admin/src/components/HomeComponent.js`:
```javascript
import React, { Component } from 'react';

class Home extends Component {
  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">ADMIN HOME</h2>
        <img src="http://cliparting.com/wp-content/uploads/2018/03/animated-emoticons-2018-13.gif" width="800px" height="600px" alt="" />
      </div>
    );
  }
}
export default Home;
```

Tạo file `client-admin/src/components/MainComponent.js`:
```javascript
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import Menu from './MenuComponent';
import Home from './HomeComponent';
import { Routes, Route, Navigate } from 'react-router-dom';

class Main extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  render() {
    if (this.context.token !== '') {
      return (
        <div className="body-admin">
          <Menu />
          <Routes>
            <Route path='/admin' element={<Navigate replace to='/admin/home' />} />
            <Route path='/admin/home' element={<Home />} />
          </Routes>
        </div>
      );
    }
    return (<div />);
  }
}
export default Main;
```

#### React Router
Cài đặt thư viện `react-router-dom`:
<div class="client-admin">

```bash
$ npm install react-router-dom --save
```

</div>

Cập nhật file `client-admin/src/App.js`:
```javascript
import { BrowserRouter } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <MyProvider>
        <Login />
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </MyProvider>
    );
  }
}
```

##### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin`
