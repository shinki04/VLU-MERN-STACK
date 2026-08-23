# Lab 02: MERN Stack - Shopping Online (Admin Login & Logout)

## MERN Stack

### Models
Create `server/models/Models.js` file:
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

### Utils
Create `server/utils/MyConstants.js` file:
```javascript
const MyConstants = {
  DB_SERVER: '<cluster>.mongodb.net',
  DB_USER: '<db_user>',
  DB_PASS: '<db_pass>',
  DB_DATABASE: '<db_name>',
  EMAIL_USER: '<email_user>', // Microsoft mail service
  EMAIL_PASS: '<email_pass>',
  JWT_SECRET: '<jwt_secret>',
  JWT_EXPIRES: '<jwt_expires>', // in milliseconds
};
module.exports = MyConstants;
```
::: warning WARNING
- Do not store sensitive information like credentials, passwords, JWT secrets, or database connection strings directly in the source code.
- Please store these values in a `.env` file and ensure that the `.env` file is added to `.gitignore` to prevent accidentally pushing sensitive information to GitHub or other source control systems.
:::

Create `server/utils/MongooseUtil.js` file:
Install `mongoose` library:
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

Create `server/utils/CryptoUtil.js` file:
Install `crypto` library:
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

Create `server/utils/EmailUtil.js` file:
Install `nodemailer` library:
<div class="cmd-server">

```bash
$ npm install nodemailer --save
```

</div>

  ::: warning WARNING
  You can use Gmail as an alternative because Hotmail is no longer supported by Microsoft. If you encounter errors, please see [Common Errors when Configuring Email](/en/troubleshooting/hotmail).
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
    const text = 'Thank you for registering, please enter the following information to activate your account:\n\t .id: ' + id + '\n\t .token: ' + token;
    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'Register | Verification',
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

Create `server/utils/JwtUtil.js` file:
Install `jsonwebtoken` library:
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
            message: 'Invalid token'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Auth token not found'
      });
    }
  }
};
module.exports = JwtUtil;
```

### Stylesheets (CSS)
Update the CSS files `client-admin/src/App.css` and `client-customer/src/App.css` (see source code for details).

## Functionals

### Admin - Login & Logout

#### Server
Create `server/models/AdminDAO.js` file:
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

Create `server/api/admin.js` file:
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
      res.json({ success: true, message: 'Login successful', token: token });
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } else {
    res.json({ success: false, message: 'Please enter username and password' });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Valid token', token: token });
});

module.exports = router;
```

Update `server/index.js` file:
```javascript
// apis
app.use('/api/admin', require('./api/admin.js'));
```

##### Test with Postman
- (POST) `http://localhost:3000/api/admin/login`
  - Body (raw+JSON): 
    ```json
      { 
        "username": "admin", 
        "password": "123" 
      }
    ```
  - Result:

  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjMiLCJpYXQiOjE3ODc0NzkzNjYsImV4cCI6MTc4NzU2ODAwN30.AG3n4IJPSN5FVvZc5JUCAOurwSqPsVvcrhqynpl3tKA"
  }
  ```
  ::: warning WARNING
  If the returned result is:

  ```json
  {
    "success": false,
    "message": "Incorrect username or password"
  }
  ```

  Please double check the admin account information in the database.

  If there is no admin data yet, you can import data from the `admins.json` file into the `shoppingonline` database following the instructions [here](/en/labs/lab1#mongodb-atlas).

  You can get the `admins.json` file [here](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/admins.json).

  :::

- (GET) `http://localhost:3000/api/admin/token`
  - Headers: `"x-access-token": <token>`

  - Result:
    ```json
      {
          "success": true,
          "message": "Token is valid",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjMiLCJpYXQiOjE3ODc0NzkzNjYsImV4cCI6MTc4NzU2ODAwN30.AG3n4IJPSN5FVvZc5JUCAOurwSqPsVvcrhqynpl3tKA"
      }
    ```

#### Client-admin

Create Context `client-admin/src/contexts/MyContext.js` file:
```javascript
import React from 'react';
const MyContext = React.createContext();
export default MyContext;
```

Create Provider `client-admin/src/contexts/MyProvider.js` file:
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

Update `client-admin/src/App.js` file:
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

Create `client-admin/src/components/LoginComponent.js` file:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Login extends Component {
  static contextType = MyContext; // use this.context to access global state
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
      alert('Please enter username and password');
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

Create `client-admin/src/components/MenuComponent.js` file:
```javascript
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { Link } from 'react-router-dom';

class Menu extends Component {
  static contextType = MyContext; // use this.context to access global state
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
          Hello <b>{this.context.username}</b> | <Link to='/admin/home' onClick={() => this.lnkLogoutClick()}>Logout</Link>
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

Create `client-admin/src/components/HomeComponent.js` file:
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

Create `client-admin/src/components/MainComponent.js` file:
```javascript
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import Menu from './MenuComponent';
import Home from './HomeComponent';
import { Routes, Route, Navigate } from 'react-router-dom';

class Main extends Component {
  static contextType = MyContext; // use this.context to access global state
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
Install `react-router-dom` library:
<div class="client-admin">

```bash
$ npm install react-router-dom --save
```

</div>

Update `client-admin/src/App.js` file:
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

##### Test on Browser
- `http://localhost:3001/admin`