# Lab 08: MERN Stack - Shopping Online (Admin - Order Management)

## MERN Stack

### Functionals

#### Admin - listorder

##### Server

Update `server/models/OrderDAO.js` file:
```javascript
...
const OrderDAO = {
  ...,
  async selectAll() {
    const query = {};
    const mysort = { cdate: -1 }; // sort descending by date
    const orders = await Models.Order.find(query).sort(mysort).exec();
    return orders;
  }
};
...
```

Update `server/api/admin.js` file:
```javascript
...
// daos
const OrderDAO = require('../models/OrderDAO');
...
// order
router.get('/orders', JwtUtil.checkToken, async function (req, res) {
  const orders = await OrderDAO.selectAll();
  res.json(orders);
});
...
```

###### Test with Postman
- (GET) `http://localhost:3000/api/admin/orders`
- Headers: `"x-access-token": <token>`

##### Client-admin

Create `client-admin/src/components/OrderComponent.js` file:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext; // use this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null
    };
  }
  render() {
    const orders = this.state.orders.map((item) => {
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trItemClick(item)}>
          <td>{item._id}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.customer.name}</td>
          <td>{item.customer.phone}</td>
          <td>{item.total}</td>
          <td>{item.status}</td>
          <td>
            {item.status === 'PENDING' ?
              <div><span className="link">APPROVE</span> || <span className="link">CANCEL</span></div>
              : <div />}
          </td>
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
                <th>Action</th>
              </tr>
              {orders}
            </tbody>
          </table>
        </div>
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
    this.apiGetOrders();
  }
  // event-handlers
  trItemClick(item) {
    this.setState({ order: item });
  }
  // apis
  apiGetOrders() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/orders', config).then((res) => {
      const result = res.data;
      this.setState({ orders: result });
    });
  }
}
export default Order;
```

Update `client-admin/src/components/MenuComponent.js` file:
```javascript
...
class Menu extends Component {
  ...
  render() {
    return (
      ...
        <li className="menu"><Link to='/admin/order'>Order</Link></li>
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
import Order from './OrderComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/admin/order' element={<Order />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Test on Browser
- `http://localhost:3001/admin/order`

#### Admin - Update Status

##### Server

Update `server/models/OrderDAO.js` file:
```javascript
...
const OrderDAO = {
  ...,
  async update(_id, newStatus) {
    const newvalues = { status: newStatus };
    const result = await Models.Order.findByIdAndUpdate(_id, newvalues, { new: true });
    return result;
  }
};
...
```

Update `server/api/admin.js` file:
```javascript
...
// order
router.put('/orders/status/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const newStatus = req.body.status;
  const result = await OrderDAO.update(_id, newStatus);
  res.json(result);
});
...
```

###### Test with Postman
- (PUT) `http://localhost:3000/api/admin/orders/status/<id>`
- Headers: `"x-access-token": <token>`
- Body (raw+JSON): `{ "status": "APPROVED" }` or `{ "status": "CANCELED" }`

##### Client-admin

Update `client-admin/src/components/OrderComponent.js` file:
```javascript
...
class Order extends Component {
  ...
  render() {
    const orders = this.state.orders.map((item) => {
      return (
        ...
            {item.status === 'PENDING' ?
              <div><span className="link" onClick={() => this.lnkApproveClick(item._id)}>APPROVE</span> || <span className="link" onClick={() => this.lnkCancelClick(item._id)}>CANCEL</span></div>
              : <div />}
        ...
      );
    });
    ...
  }
  // event-handlers
  lnkApproveClick(id) {
    this.apiPutOrderStatus(id, 'APPROVED');
  }
  lnkCancelClick(id) {
    this.apiPutOrderStatus(id, 'CANCELED');
  }
  // apis
  apiPutOrderStatus(id, status) {
    const body = { status: status };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/orders/status/' + id, body, config).then((res) => {
      const result = res.data;
      if (result) {
        this.apiGetOrders();
      } else {
        alert('AN ERROR OCCURRED!');
      }
    });
  }
}
...
```

###### Test on Browser
- `http://localhost:3001/admin/order`
