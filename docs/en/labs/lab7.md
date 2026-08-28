# Lab 07: MERN Stack - Shopping Online (Customer - Cart & Checkout)

## MERN Stack

### Functionals

#### Customer - Add to Cart

##### Client-customer

Update `client-customer/src/contexts/MyProvider.js` file:
```javascript
...
class MyProvider extends Component {
  constructor(props) {
    ...
    this.state = { // global state
      // variables
      ...,
      mycart: [],
      // functions
      ...,
      setMycart: this.setMycart
    };
  }
  setMycart = (value) => {
    this.setState({ mycart: value });
  }
  ...
}
...
```

Update `client-customer/src/components/ProductDetailComponent.js` file:
```javascript
...
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext; // use this.context to access global state
  constructor(props) {
    ...
    this.state = {
      ...,
      txtQuantity: 1
    };
  }
  render() {
    ...
    return (
      ...
      <table>
        ...
        <tr>
          <td align="right">Quantity:</td>
          <td><input type="number" min="1" max="99" value={this.state.txtQuantity} onChange={(e) => { this.setState({ txtQuantity: e.target.value }) }} /></td>
        </tr>
        <tr>
          <td></td>
          <td><input type="submit" value="ADD TO CART" onClick={(e) => this.btnAdd2CartClick(e)} /></td>
        </tr>
        ...
      </table>
      ...
    );
    ...
  }
  // event-handlers
  btnAdd2CartClick(e) {
    e.preventDefault();
    const product = this.state.product;
    const quantity = parseInt(this.state.txtQuantity);
    if (quantity) {
      const mycart = this.context.mycart;
      const index = mycart.findIndex(x => x.product._id === product._id); // check if _id is already in mycart
      if (index === -1) { // not found, add new item
        const newItem = { product: product, quantity: quantity };
        mycart.push(newItem);
      } else { // increase quantity
        mycart[index].quantity += quantity;
      }
      this.context.setMycart(mycart);
      alert('ADD TO CART SUCCESS!');
    } else {
      alert('Please enter quantity');
    }
  }
  ...
}
...
```

Update `client-customer/src/components/InformComponent.js` file:
```javascript
...
class Inform extends Component {
  ...
  render() {
    return (
      ...
      <Link to=''>My cart</Link> have <b>{this.context.mycart.length}</b> items
      ...
    );
  }
  ...
}
...
```

###### Test on Browser
- `http://localhost:3002/product/<id>`

#### Customer - My Cart

##### Client-customer

Create `client-customer/src/utils/CartUtil.js` file:
```javascript
const CartUtil = {
  getTotal(mycart) {
    var total = 0;
    for (const item of mycart) {
      total += item.product.price * item.quantity;
    }
    return total;
  }
};
export default CartUtil;
```

Create `client-customer/src/components/MycartComponent.js` file:
```javascript
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';

class Mycart extends Component {
  static contextType = MyContext; // use this.context to access global state
  render() {
    const mycart = this.context.mycart.map((item, index) => {
      return (
        <tr key={item.product._id} className="datatable">
          <td>{index + 1}</td>
          <td>{item.product._id}</td>
          <td>{item.product.name}</td>
          <td>{item.product.category.name}</td>
          <td><img src={"data:image/jpg;base64," + item.product.image} width="70px" height="70px" alt="" /></td>
          <td>{item.product.price}</td>
          <td>{item.quantity}</td>
          <td>{item.product.price * item.quantity}</td>
          <td><span className="link">Remove</span></td>
        </tr>
      );
    });
    return (
      <div className="align-center">
        <h2 className="text-center">ITEM LIST</h2>
        <table className="datatable" border="1">
          <tbody>
            <tr className="datatable">
              <th>No.</th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Image</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
            {mycart}
            <tr>
              <td colSpan="6"></td>
              <td>Total</td>
              <td>{CartUtil.getTotal(this.context.mycart)}</td>
              <td><span className="link">CHECKOUT</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
export default Mycart;
```

Update `client-customer/src/components/InformComponent.js` file:
```javascript
...
class Inform extends Component {
  ...
  render() {
    return (
      ...
      <Link to='/mycart'>My cart</Link> have <b>{this.context.mycart.length}</b> items
      ...
    );
  }
  // event-handlers
  lnkLogoutClick() {
    ...
    this.context.setMycart([]);
  }
}
...
```

Update `client-customer/src/components/MainComponent.js` file:
```javascript
...
import Mycart from './MycartComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/mycart' element={<Mycart />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Test on Browser
- `http://localhost:3002/mycart`

#### Customer - Remove from Cart

##### Client-customer

Update `client-customer/src/components/MycartComponent.js` file:
```javascript
...
class Mycart extends Component {
  ...
  render() {
    const mycart = this.context.mycart.map((item, index) => {
      return (
        ...
        <td><span className="link" onClick={() => this.lnkRemoveClick(item.product._id)}>Remove</span></td>
        ...
      );
    });
    ...
  }
  // event-handlers
  lnkRemoveClick(id) {
    const mycart = this.context.mycart;
    const index = mycart.findIndex(x => x.product._id === id);
    if (index !== -1) { // found, remove item
      mycart.splice(index, 1);
      this.context.setMycart(mycart);
    }
  }
}
...
```

###### Test on Browser
- `http://localhost:3002/mycart`

#### Customer - Checkout

##### Server

Create `server/models/OrderDAO.js` file:
```javascript
require('../utils/MongooseUtil');
const Models = require('./Models');

const OrderDAO = {
  async insert(order) {
    const mongoose = require('mongoose');
    order._id = new mongoose.Types.ObjectId();
    const result = await Models.Order.create(order);
    return result;
  }
};
module.exports = OrderDAO;
```

Update `server/api/customer.js` file:
```javascript
...
// daos
const OrderDAO = require('../models/OrderDAO');
...
// mycart
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  const now = new Date().getTime(); // milliseconds
  const total = req.body.total;
  const items = req.body.items;
  const customer = req.body.customer;
  const order = { cdate: now, total: total, status: 'PENDING', customer: customer, items: items };
  const result = await OrderDAO.insert(order);
  res.json(result);
});
...
```

###### Test with Postman
- (POST) `http://localhost:3000/api/customer/checkout`
- Headers: `"x-access-token": <token>`
- Body(raw+JSON): `{ ... }`

##### Client-customer

Update `client-customer/src/components/MycartComponent.js` file:
```javascript
...
import axios from 'axios';
import withRouter from '../utils/withRouter';

class Mycart extends Component {
  ...
  render() {
    ...
    return (
      ...
        <td><span className="link" onClick={() => this.lnkCheckoutClick()}>CHECKOUT</span></td>
      ...
    );
  }
  // event-handlers
  lnkCheckoutClick() {
    if (window.confirm('ARE YOU SURE YOU WANT TO CHECKOUT?')) {
      if (this.context.mycart.length > 0) {
        const total = CartUtil.getTotal(this.context.mycart);
        const items = this.context.mycart;
        const customer = this.context.customer;
        if (customer) {
          this.apiCheckout(total, items, customer);
        } else {
          this.props.navigate('/login');
        }
      } else {
        alert('Your cart is empty');
      }
    }
  }
  // apis
  apiCheckout(total, items, customer) {
    const body = { total: total, items: items, customer: customer };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/customer/checkout', body, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('ORDER SUCCESS!');
        this.context.setMycart([]);
        this.props.navigate('/home');
      } else {
        alert('AN ERROR OCCURRED!');
      }
    });
  }
  ...
}
export default withRouter(Mycart);
```

###### Test on Browser
- `http://localhost:3002/mycart`

#### Customer - My Orders

##### Server

Update `server/models/OrderDAO.js` file:
```javascript
...
const OrderDAO = {
  ...,
  async selectByCustID(_cid) {
    const query = { 'customer._id': _cid };
    const orders = await Models.Order.find(query).exec();
    return orders;
  }
};
...
```

Update `server/api/customer.js` file:
```javascript
...
// myorders
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});
...
```

###### Test with Postman
- (GET) `http://localhost:3000/api/customer/orders/customer/<cid>`
- Headers: `"x-access-token": <token>`

##### Client-customer

Create `client-customer/src/components/MyordersComponent.js` file:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Myorders extends Component {
  static contextType = MyContext; // use this.context to access global state
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null
    };
  }
  render() {
    if (this.context.token === '') return (<Navigate replace to='/login' />);
    const orders = this.state.orders.map((item) => {
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trItemClick(item)}>
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
    if (this.context.customer) {
      const cid = this.context.customer._id;
      this.apiGetOrdersByCustID(cid);
    }
  }
  // event-handlers
  trItemClick(item) {
    this.setState({ order: item });
  }
  // apis
  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/customer/orders/customer/' + cid, config).then((res) => {
      const result = res.data;
      this.setState({ orders: result });
    });
  }
}
export default Myorders;
```

Update `client-customer/src/components/InformComponent.js` file:
```javascript
...
class Inform extends Component {
  ...
  render() {
    return (
      ...
        <Link to='/myorders'>My orders</Link>
      ...
    );
  }
...
}
...
```

Update `client-customer/src/components/MainComponent.js` file:
```javascript
...
import Myorders from './MyordersComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/myorders' element={<Myorders />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Test on Browser
- `http://localhost:3002/myorders`
