# Lab 09: MERN Stack - Shopping Online (Admin - Customer Management)

## MERN Stack

### Functionals

#### Admin - listcustomer

##### Server

Update `server/models/CustomerDAO.js` file:
```javascript
...
const CustomerDAO = {
  ...,
  async selectAll() {
    const query = {};
    const customers = await Models.Customer.find(query).exec();
    return customers;
  }
};
...
```

Update `server/api/admin.js` file:
```javascript
...
// daos
const CustomerDAO = require('../models/CustomerDAO');
...
// customer
router.get('/customers', JwtUtil.checkToken, async function (req, res) {
  const customers = await CustomerDAO.selectAll();
  res.json(customers);
});
// order
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});
...
```

###### Test with Postman
- (GET) `http://localhost:3000/api/admin/customers`
  - Headers: `"x-access-token": <token>`
- (GET) `http://localhost:3000/api/admin/orders/customer/<cid>`
  - Headers: `"x-access-token": <token>`

##### Client-admin

Create `client-admin/src/components/CustomerComponent.js` file:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Customer extends Component {
  static contextType = MyContext; // use this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null
    };
  }
  render() {
    const customers = this.state.customers.map((item) => {
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trCustomerClick(item)}>
          <td>{item._id}</td>
          <td>{item.username}</td>
          <td>{item.password}</td>
          <td>{item.name}</td>
          <td>{item.phone}</td>
          <td>{item.email}</td>
          <td>{item.active}</td>
          <td>
            {item.active === 0 ?
              <span className="link">EMAIL</span>
              :
              <span className="link">DEACTIVE</span>}
          </td>
        </tr>
      );
    });
    const orders = this.state.orders.map((item) => {
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trOrderClick(item)}>
          <td>{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer.name}</td>
          <td>{item.customer.phone}</td>
          <td>{item.total}</td>
          <td>{item.status}</td>
        </tr>
      );
    });
    if (this.state.order) {
      var items = this.state.order.items.map((item, index) => {
        return (
          <tr key={item.product._id} className="datatable">
            <td>{index + 1}</td>
            <td>{item.product._id}</td>
            <td>{item.product.name}</td>
            <td><img src={"data:image/jpg;base64," + item.product.image} width="70px" height="70px" alt="" /></td>
            <td>{item.product.price}</td>
            <td>{item.quantity}</td>
            <td>{item.product.price * item.quantity}</td>
          </tr>
        );
      });
    }
    return (
      <div>
        <div className="align-center">
          <h2 className="text-center">CUSTOMER LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Username</th>
                <th>Password</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
              {customers}
            </tbody>
          </table>
        </div>
        {this.state.orders.length > 0 ?
          <div className="align-center">
            <h2 className="text-center">ORDER LIST</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust.name</th>
                  <th>Cust.phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
                {orders}
              </tbody>
            </table>
          </div>
          : <div />}
        {this.state.order ?
          <div className="align-center">
            <h2 className="text-center">ORDER DETAIL</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>No.</th>
                  <th>Prod.ID</th>
                  <th>Prod.name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
                {items}
              </tbody>
            </table>
          </div>
          : <div />}
      </div>
    );
  }
  componentDidMount() {
    this.apiGetCustomers();
  }
  // event-handlers
  trCustomerClick(item) {
    this.setState({ orders: [], order: null });
    this.apiGetOrdersByCustID(item._id);
  }
  trOrderClick(item) {
    this.setState({ order: item });
  }
  // apis
  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers', config).then((res) => {
      const result = res.data;
      this.setState({ customers: result });
    });
  }
  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders/customer/' + cid, config).then((res) => {
      const result = res.data;
      this.setState({ orders: result });
    });
  }
}
export default Customer;
```

Update `client-admin/src/components/MenuComponent.js` file:
```javascript
...
class Menu extends Component {
  ...
  render() {
    return (
      ...
        <li className="menu"><Link to='/admin/customer'>Customer</Link></li>
      ...
    );
  }
  ...
}
...
```

Update `client-admin/src/components/MainComponent.js` file:
```javascript
...
import Customer from './CustomerComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/admin/customer' element={<Customer />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Test on Browser
- `http://localhost:3001/admin/customer`

#### Admin - Deactivate Account

##### Server

Update `server/api/admin.js` file:
```javascript
...
// customer
router.put('/customers/deactive/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const token = req.body.token;
  const result = await CustomerDAO.active(_id, token, 0);
  res.json(result);
});
...
```

###### Test with Postman
- (PUT) `http://localhost:3000/api/admin/customers/deactive/<id>`
- Headers: `"x-access-token": <token>`
- Body (raw+JSON): `{ "token": "7326926c91439cbb0adf64ced3203a52" }`

##### Client-admin

Update `client-admin/src/components/CustomerComponent.js` file:
```javascript
...
class Customer extends Component {
  ...
  render() {
    const customers = this.state.customers.map((item) => {
      return (
        ...
            <span className="link" onClick={() => this.lnkDeactiveClick(item)}>DEACTIVE</span>}
        ...
      );
    });
    ...
  }
  // event-handlers
  lnkDeactiveClick(item) {
    this.apiPutCustomerDeactive(item._id, item.token);
  }
  // apis
  apiPutCustomerDeactive(id, token) {
    const body = { token: token };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/customers/deactive/' + id, body, config).then((res) => {
      const result = res.data;
      if (result) {
        this.apiGetCustomers();
      } else {
        alert('AN ERROR OCCURRED!');
      }
    });
  }
  ...
}
...
```

###### Test on Browser
- `http://localhost:3001/admin/customer`

#### Admin - Send Email

##### Server

Update `server/models/CustomerDAO.js` file:
```javascript
...
const CustomerDAO = {
  ...,
  async selectByID(_id) {
    const customer = await Models.Customer.findById(_id).exec();
    return customer;
  }
};
...
```

Update `server/api/admin.js` file:
```javascript
...
// utils
const EmailUtil = require('../utils/EmailUtil');
...
// customer
router.get('/customers/sendmail/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const cust = await CustomerDAO.selectByID(_id);
  if (cust) {
    const send = await EmailUtil.send(cust.email, cust._id, cust.token);
    if (send) {
      res.json({ success: true, message: 'Please check email' });
    } else {
      res.json({ success: false, message: 'Failed to send email' });
    }
  } else {
    res.json({ success: false, message: 'Customer does not exist' });
  }
});
...
```

###### Test with Postman
- (GET) `http://localhost:3000/api/admin/customers/sendmail/<id>`
- Headers: `"x-access-token": <token>`

##### Client-admin

Update `client-admin/src/components/CustomerComponent.js` file:
```javascript
...
class Customer extends Component {
  ...
  render() {
    const customers = this.state.customers.map((item) => {
      return (
        ...
            <span className="link" onClick={() => this.lnkEmailClick(item)}>EMAIL</span>
        ...
      );
    });
    ...
  }
  // event-handlers
  lnkEmailClick(item) {
    this.apiGetCustomerSendmail(item._id);
  }
  // apis
  apiGetCustomerSendmail(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers/sendmail/' + id, config).then((res) => {
      const result = res.data;
      alert(result.message);
    });
  }
  ...
}
...
```

###### Test on Browser
- `http://localhost:3001/admin/customer`
