# Lab 07: MERN Stack - Mua Sắm Trực Tuyến (Customer - Giỏ Hàng & Thanh Toán)

## MERN Stack

### Chức năng (Functionals)

#### Customer - Thêm vào giỏ hàng (add2cart)

##### Client-customer

Cập nhật file `client-customer/src/contexts/MyProvider.js`:
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

Cập nhật file `client-customer/src/components/ProductDetailComponent.js`:
```javascript
...
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
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
      const index = mycart.findIndex(x => x.product._id === product._id); // kiểm tra xem _id đã có trong mycart chưa
      if (index === -1) { // không tìm thấy, thêm sản phẩm mới
        const newItem = { product: product, quantity: quantity };
        mycart.push(newItem);
      } else { // tăng số lượng
        mycart[index].quantity += quantity;
      }
      this.context.setMycart(mycart);
      alert('THÊM VÀO GIỎ THÀNH CÔNG!');
    } else {
      alert('Vui lòng nhập số lượng');
    }
  }
  ...
}
...
```

Cập nhật file `client-customer/src/components/InformComponent.js`:
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

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/product/<id>`

#### Customer - Giỏ hàng của tôi (mycart)

##### Client-customer

Tạo file `client-customer/src/utils/CartUtil.js`:
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

Tạo file `client-customer/src/components/MycartComponent.js`:
```javascript
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';

class Mycart extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
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

Cập nhật file `client-customer/src/components/InformComponent.js`:
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

Cập nhật file `client-customer/src/components/MainComponent.js`:
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

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/mycart`

#### Customer - Xóa khỏi giỏ hàng (remove2cart)

##### Client-customer

Cập nhật file `client-customer/src/components/MycartComponent.js`:
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
    if (index !== -1) { // tìm thấy, xóa sản phẩm
      mycart.splice(index, 1);
      this.context.setMycart(mycart);
    }
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/mycart`

#### Customer - Thanh toán (checkout)

##### Server

Tạo file `server/models/OrderDAO.js`:
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

Cập nhật file `server/api/customer.js`:
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

###### Kiểm tra với Postman
- (POST) `http://localhost:3000/api/customer/checkout`
- Headers: `"x-access-token": <token>`
- Body(raw+JSON): `{ ... }`

##### Client-customer

Cập nhật file `client-customer/src/components/MycartComponent.js`:
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
    if (window.confirm('BẠN CÓ CHẮC CHẮN MUỐN THANH TOÁN?')) {
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
        alert('Giỏ hàng của bạn đang trống');
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
        alert('ĐẶT HÀNG THÀNH CÔNG!');
        this.context.setMycart([]);
        this.props.navigate('/home');
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
  ...
}
export default withRouter(Mycart);
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/mycart`

#### Customer - Đơn hàng của tôi (myorders)

##### Server

Cập nhật file `server/models/OrderDAO.js`:
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

Cập nhật file `server/api/customer.js`:
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

###### Kiểm tra với Postman
- (GET) `http://localhost:3000/api/customer/orders/customer/<cid>`
- Headers: `"x-access-token": <token>`

##### Client-customer

Tạo file `client-customer/src/components/MyordersComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Myorders extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
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

Cập nhật file `client-customer/src/components/InformComponent.js`:
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

Cập nhật file `client-customer/src/components/MainComponent.js`:
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

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/myorders`
