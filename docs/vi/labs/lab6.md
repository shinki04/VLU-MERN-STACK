# Lab 06: MERN Stack - Mua Sắm Trực Tuyến (Customer - Tài khoản)

## MERN Stack

### Chức năng (Functionals)

#### Customer - Đăng ký (signup)

##### Server

Tạo file `server/models/CustomerDAO.js`:
```javascript
require('../utils/MongooseUtil');
const Models = require('./Models');

const CustomerDAO = {
  async selectByUsernameOrEmail(username, email) {
    const query = { $or: [{ username: username }, { email: email }] };
    const customer = await Models.Customer.findOne(query);
    return customer;
  },
  async insert(customer) {
    const mongoose = require('mongoose');
    customer._id = new mongoose.Types.ObjectId();
    const result = await Models.Customer.create(customer);
    return result;
  }
};
module.exports = CustomerDAO;
```

Cập nhật file `server/api/customer.js`:
```javascript
...
// utils
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
...
// daos
const CustomerDAO = require('../models/CustomerDAO');
...
// customer
router.post('/signup', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
  if (dbCust) {
    res.json({ success: false, message: 'Tài khoản hoặc email đã tồn tại' });
  } else {
    const now = new Date().getTime(); // milliseconds
    const token = CryptoUtil.md5(now.toString());
    const newCust = { username: username, password: password, name: name, phone: phone, email: email, active: 0, token: token };
    const result = await CustomerDAO.insert(newCust);
    if (result) {
      const send = await EmailUtil.send(email, result._id, token);
      if (send) {
        res.json({ success: true, message: 'Vui lòng kiểm tra email để kích hoạt' });
      } else {
        res.json({ success: false, message: 'Lỗi gửi email' });
      }
    } else {
      res.json({ success: false, message: 'Lỗi thêm tài khoản' });
    }
  }
});
...
```

###### Kiểm tra với Postman
- (POST) `http://localhost:3000/api/customer/signup`
- Body (raw+JSON): `{ "username": "sonkk", "password": "123", "name": "SonKK", "phone": "0123456789", "email": "sonkk@gmail.com" }`

##### Client-customer

Tạo file `client-customer/src/components/SignupComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: ''
    };
  }
  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">SIGN-UP</h2>
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
                <td>Name</td>
                <td><input type="text" value={this.state.txtName} onChange={(e) => { this.setState({ txtName: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td>Phone</td>
                <td><input type="tel" value={this.state.txtPhone} onChange={(e) => { this.setState({ txtPhone: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td>Email</td>
                <td><input type="email" value={this.state.txtEmail} onChange={(e) => { this.setState({ txtEmail: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td></td>
                <td><input type="submit" value="SIGN-UP" onClick={(e) => this.btnSignupClick(e)} /></td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
  // event-handlers
  btnSignupClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    const name = this.state.txtName;
    const phone = this.state.txtPhone;
    const email = this.state.txtEmail;
    if (username && password && name && phone && email) {
      const account = { username: username, password: password, name: name, phone: phone, email: email };
      this.apiSignup(account);
    } else {
      alert('Vui lòng nhập đầy đủ thông tin');
    }
  }
  // apis
  apiSignup(account) {
    axios.post('/api/customer/signup', account).then((res) => {
      const result = res.data;
      alert(result.message);
    });
  }
}
export default Signup;
```

Cập nhật file `client-customer/src/components/InformComponent.js`:
```javascript
...
class Inform extends Component {
  render() {
    return (
      ...
        <Link to='/signup'>Sign-up</Link>
      ...
    );
  }
}
...
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
import Signup from './SignupComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/signup' element={<Signup />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/signup`

#### Customer - Kích hoạt tài khoản (active)

##### Server

Cập nhật file `server/models/CustomerDAO.js`:
```javascript
...
const CustomerDAO = {
  ...,
  async active(_id, token, active) {
    const query = { _id: _id, token: token };
    const newvalues = { active: active };
    const result = await Models.Customer.findOneAndUpdate(query, newvalues, { new: true });
    return result;
  }
};
...
```

Cập nhật file `server/api/customer.js`:
```javascript
...
// customer
router.post('/active', async function (req, res) {
  const _id = req.body.id;
  const token = req.body.token;
  const result = await CustomerDAO.active(_id, token, 1);
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (POST) `http://localhost:3000/api/customer/active`
- Body(raw+JSON): `{ "id": "6447651efa121665c6862520", "token": "7e3a26a562dede3095bf4151459fc273" }`

##### Client-customer

Tạo file `client-customer/src/components/ActiveComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtToken: ''
    };
  }
  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">ACTIVE ACCOUNT</h2>
        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>ID</td>
                <td><input type="text" value={this.state.txtID} onChange={(e) => { this.setState({ txtID: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td>Token</td>
                <td><input type="text" value={this.state.txtToken} onChange={(e) => { this.setState({ txtToken: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td></td>
                <td><input type="submit" value="ACTIVE" onClick={(e) => this.btnActiveClick(e)} /></td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
  // event-handlers
  btnActiveClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const token = this.state.txtToken;
    if (id && token) {
      this.apiActive(id, token);
    } else {
      alert('Vui lòng nhập ID và Token');
    }
  }
  // apis
  apiActive(id, token) {
    const body = { id: id, token: token };
    axios.post('/api/customer/active', body).then((res) => {
      const result = res.data;
      if (result) {
        alert('KÍCH HOẠT THÀNH CÔNG!');
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
}
export default Active;
```

Cập nhật file `client-customer/src/components/InformComponent.js`:
```javascript
...
class Inform extends Component {
  render() {
    return (
      ...
        <Link to='/active'>Active</Link>
      ...
    );
  }
...
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
import Active from './ActiveComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/active' element={<Active />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/active`

#### Customer - Đăng nhập & Đăng xuất (login & logout)

##### Server

Cập nhật file `server/models/CustomerDAO.js`:
```javascript
...
const CustomerDAO = {
  ...,
  async selectByUsernameAndPassword(username, password) {
    const query = { username: username, password: password };
    const customer = await Models.Customer.findOne(query);
    return customer;
  }
};
...
```

Cập nhật file `server/api/customer.js`:
```javascript
...
// customer
router.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);
    if (customer) {
      if (customer.active === 1) {
        const token = JwtUtil.genToken();
        res.json({ success: true, message: 'Đăng nhập thành công', token: token, customer: customer });
      } else {
        res.json({ success: false, message: 'Tài khoản chưa được kích hoạt' });
      }
    } else {
      res.json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }
  } else {
    res.json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
  }
});
router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token hợp lệ', token: token });
});
...
```

###### Kiểm tra với Postman
- (POST) `http://localhost:3000/api/customer/login`
  - Body (raw+JSON): `{ "username": "sonkk", "password": "123" }`
- (GET) `http://localhost:3000/api/customer/token`
  - Headers: `"x-access-token": <token>`

##### Client-customer

Tạo file `client-customer/src/contexts/MyContext.js`:
```javascript
import React from 'react';
const MyContext = React.createContext();
export default MyContext;
```

Tạo file `client-customer/src/contexts/MyProvider.js`:
```javascript
import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { // global state
      // variables
      token: '',
      customer: null,
      // functions
      setToken: this.setToken,
      setCustomer: this.setCustomer
    };
  }
  setToken = (value) => {
    this.setState({ token: value });
  }
  setCustomer = (value) => {
    this.setState({ customer: value });
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

Cập nhật file `client-customer/src/App.js`:
```javascript
...
import MyProvider from './contexts/MyProvider';

class App extends Component {
  render() {
    return (
      <MyProvider>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </MyProvider>
    );
  }
}
...
```

Tạo file `client-customer/src/components/LoginComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';

class Login extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: 'sonkk',
      txtPassword: '123'
    };
  }
  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">CUSTOMER LOGIN</h2>
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
  // event-handlers
  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    if (username && password) {
      const account = { username: username, password: password };
      this.apiLogin(account);
    } else {
      alert('Vui lòng nhập tên đăng nhập và mật khẩu');
    }
  }
  // apis
  apiLogin(account) {
    axios.post('/api/customer/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setCustomer(result.customer);
        this.props.navigate('/home');
      } else {
        alert(result.message);
      }
    });
  }
}
export default withRouter(Login);
```

Cập nhật file `client-customer/src/components/InformComponent.js`:
```javascript
...
import MyContext from '../contexts/MyContext';

class Inform extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  render() {
    return (
      ...
        <div className="float-left">
        {this.context.token === '' ?
          <div><Link to='/login'>Login</Link> | <Link to='/signup'>Sign-up</Link> | <Link to='/active'>Active</Link></div>
          :
          <div>Hello <b>{this.context.customer.name}</b> | <Link to='/home' onClick={() => this.lnkLogoutClick()}>Logout</Link> | <Link to=''>My profile</Link> | <Link to=''>My orders</Link></div>
        }
        </div>
      ...
    );
  }
  // event-handlers
  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setCustomer(null);
  }
}
...
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
import Login from './LoginComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/login' element={<Login />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/login`

#### Customer - Hồ sơ cá nhân (myprofile)

##### Server

Cập nhật file `server/models/CustomerDAO.js`:
```javascript
...
const CustomerDAO = {
  ...,
  async update(customer) {
    const newvalues = { username: customer.username, password: customer.password, name: customer.name, phone: customer.phone, email: customer.email };
    const result = await Models.Customer.findByIdAndUpdate(customer._id, newvalues, { new: true });
    return result;
  }
};
...
```

Cập nhật file `server/api/customer.js`:
```javascript
...
// myprofile
router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const customer = { _id: _id, username: username, password: password, name: name, phone: phone, email: email };
  const result = await CustomerDAO.update(customer);
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (PUT) `http://localhost:3000/api/customer/customers/<id>`
- Headers: `"x-access-token": <token>`
- Body(raw+JSON): `{ "username": "sonkkk", "password": "321", "name": "SonKKK", "phone": "9876543210", "email": "sonkkk@gmail.com" }`

##### Client-customer

Tạo file `client-customer/src/components/MyprofileComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Myprofile extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: ''
    };
  }
  render() {
    if (this.context.token === '') return (<Navigate replace to='/login' />);
    return (
      <div className="align-center">
        <h2 className="text-center">MY PROFILE</h2>
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
                <td>Name</td>
                <td><input type="text" value={this.state.txtName} onChange={(e) => { this.setState({ txtName: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td>Phone</td>
                <td><input type="tel" value={this.state.txtPhone} onChange={(e) => { this.setState({ txtPhone: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td>Email</td>
                <td><input type="email" value={this.state.txtEmail} onChange={(e) => { this.setState({ txtEmail: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td></td>
                <td><input type="submit" value="UPDATE" onClick={(e) => this.btnUpdateClick(e)} /></td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
  componentDidMount() {
    if (this.context.customer) {
      this.setState({
        txtUsername: this.context.customer.username,
        txtPassword: this.context.customer.password,
        txtName: this.context.customer.name,
        txtPhone: this.context.customer.phone,
        txtEmail: this.context.customer.email
      });
    }
  }
  // event-handlers
  btnUpdateClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    const name = this.state.txtName;
    const phone = this.state.txtPhone;
    const email = this.state.txtEmail;
    if (username && password && name && phone && email) {
      const customer = { username: username, password: password, name: name, phone: phone, email: email };
      this.apiPutCustomer(this.context.customer._id, customer);
    } else {
      alert('Vui lòng nhập đầy đủ thông tin');
    }
  }
  // apis
  apiPutCustomer(id, customer) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/customer/customers/' + id, customer, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('CẬP NHẬT THÀNH CÔNG!');
        this.context.setCustomer(result);
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
}
export default Myprofile;
```

Cập nhật file `client-customer/src/components/InformComponent.js`:
```javascript
...
class Inform extends Component {
  ...
  render() {
    return (
      ...
        <Link to='/myprofile'>My profile</Link>
      ...
    );
  }
...
}
...
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
import Myprofile from './MyprofileComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/myprofile' element={<Myprofile />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/myprofile`
