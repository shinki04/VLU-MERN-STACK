# Lab 05: MERN Stack - Mua Sắm Trực Tuyến (Customer - Trang chủ & Sản phẩm)

## MERN Stack

### Chức năng (Functionals)

#### Customer - Trang chủ (home)

##### Server

Cập nhật file `server/models/ProductDAO.js`:
```javascript
...
const ProductDAO = {
  ...,
  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
  },
  async selectTopNew(top) {
    const query = {};
    const mysort = { cdate: -1 }; // sắp xếp giảm dần
    const products = await Models.Product.find(query).sort(mysort).limit(top).exec();
    return products;
  },
  async selectTopHot(top) {
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } }, // sắp xếp giảm dần
      { $limit: top }
    ]).exec();
    var products = [];
    for (const item of items) {
      const product = await ProductDAO.selectByID(item._id);
      products.push(product);
    }
    return products;
  }
};
...
```

Tạo file `server/api/customer.js`:
```javascript
const express = require('express');
const router = express.Router();
// daos
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');

// category
router.get('/categories', async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

// product
router.get('/products/new', async function (req, res) {
  const products = await ProductDAO.selectTopNew(3);
  res.json(products);
});
router.get('/products/hot', async function (req, res) {
  const products = await ProductDAO.selectTopHot(3);
  res.json(products);
});

module.exports = router;
```

Cập nhật file `server/index.js`:
```javascript
...
// apis
app.use('/api/customer', require('./api/customer.js'));
```

###### Kiểm tra với Postman
- (GET) `http://localhost:3000/api/customer/categories`
- (GET) `http://localhost:3000/api/customer/products/new`
- (GET) `http://localhost:3000/api/customer/products/hot`

##### Client-customer

Tạo file `client-customer/src/components/MenuComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: []
    };
  }
  render() {
    const cates = this.state.categories.map((item) => {
      return (
        <li key={item._id} className="menu"><a href="">{item.name}</a></li>
      );
    });
    return (
      <div className="border-bottom">
        <div className="float-left">
          <ul className="menu">
            <li className="menu"><a href="">Home</a></li>
            {cates}
          </ul>
        </div>
        <div className="float-right">
          <form className="search">
            <input type="search" placeholder="Enter keyword" className="keyword" />
            <input type="submit" value="SEARCH" />
          </form>
        </div>
        <div className="float-clear" />
      </div>
    );
  }
  componentDidMount() {
    this.apiGetCategories();
  }
  // apis
  apiGetCategories() {
    axios.get('/api/customer/categories').then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    });
  }
}
export default Menu;
```

Tạo file `client-customer/src/components/InformComponent.js`:
```javascript
import React, { Component } from 'react';

class Inform extends Component {
  render() {
    return (
      <div className="border-bottom">
        <div className="float-left">
          <a href="">Login</a> | <a href="">Sign-up</a> | <a href="">Active</a>
        </div>
        <div className="float-right">
          <a href="">My cart</a> have <b>0</b> items
        </div>
        <div className="float-clear" />
      </div>
    );
  }
}
export default Inform;
```

Tạo file `client-customer/src/components/HomeComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newprods: [],
      hotprods: []
    };
  }
  render() {
    const newprods = this.state.newprods.map((item) => {
      return (
        <div key={item._id} className="inline">
          <figure>
            <a href=""><img src={"data:image/jpg;base64," + item.image} width="300px" height="300px" alt="" /></a>
            <figcaption className="text-center">{item.name}<br />Price: {item.price}</figcaption>
          </figure>
        </div>
      );
    });
    const hotprods = this.state.hotprods.map((item) => {
      return (
        <div key={item._id} className="inline">
          <figure>
            <a href=""><img src={"data:image/jpg;base64," + item.image} width="300px" height="300px" alt="" /></a>
            <figcaption className="text-center">{item.name}<br />Price: {item.price}</figcaption>
          </figure>
        </div>
      );
    });
    return (
      <div>
        <div className="align-center">
          <h2 className="text-center">NEW PRODUCTS</h2>
          {newprods}
        </div>
        {this.state.hotprods.length > 0 ?
          <div className="align-center">
            <h2 className="text-center">HOT PRODUCTS</h2>
            {hotprods}
          </div>
          : <div />}
      </div>
    );
  }
  componentDidMount() {
    this.apiGetNewProducts();
    this.apiGetHotProducts();
  }
  // apis
  apiGetNewProducts() {
    axios.get('/api/customer/products/new').then((res) => {
      const result = res.data;
      this.setState({ newprods: result });
    });
  }
  apiGetHotProducts() {
    axios.get('/api/customer/products/hot').then((res) => {
      const result = res.data;
      this.setState({ hotprods: result });
    });
  }
}
export default Home;
```

Tạo file `client-customer/src/components/MainComponent.js`:
```javascript
import React, { Component } from 'react';
import Menu from './MenuComponent';
import Inform from './InformComponent';
import Home from './HomeComponent';

class Main extends Component {
  render() {
    return (
      <div className="body-customer">
        <Menu />
        <Inform />
        <Home />
      </div>
    );
  }
}
export default Main;
```

Cập nhật file `client-customer/src/App.js`:
```javascript
import './App.css';
import React, { Component } from 'react';
import Main from './components/MainComponent';

class App extends Component {
  render() {
    return (
      <Main />
    );
  }
}
export default App;
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/`

#### React Router

Cài đặt thư viện `react-router-dom`:
<div class="client-customer">

```bash
npm install react-router-dom --save
```

</div>

Cập nhật file `client-customer/src/App.js`:
```javascript
...
import { BrowserRouter } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    );
  }
}
...
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
import { Routes, Route, Navigate } from 'react-router-dom';

class Main extends Component {
  ...
  render() {
    ...
    return (
      <div className="body-customer">
        <Menu />
        <Inform />
        <Routes>
          <Route path='/' element={<Navigate replace to='/home' />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </div>
    );
  }
}
...
```

Cập nhật file `client-customer/src/components/MenuComponent.js`:
```javascript
...
import { Link } from 'react-router-dom';

class Menu extends Component {
  ...
  render() {
    ...
    return (
      ...
        <li key={item._id} className="menu"><Link to=''>{item.name}</Link></li>
      ...
        <li className="menu"><Link to='/'>Home</Link></li>
      ...
    );
  }
...
```

Cập nhật file `client-customer/src/components/InformComponent.js`:
```javascript
...
import { Link } from 'react-router-dom';

class Inform extends Component {
  render() {
    return (
      ...
      <div className="float-left">
        <Link to=''>Login</Link> | <Link to=''>Sign-up</Link> | <Link to=''>Active</Link>
      </div>
      <div className="float-right">
        <Link to=''>My cart</Link> have <b>0</b> items
      </div>
      ...
    );
  }
}
...
```

Cập nhật file `client-customer/src/components/HomeComponent.js`:
```javascript
...
import { Link } from 'react-router-dom';

class Home extends Component {
  ...
  render() {
    ...
    return (
      ...
        <figure>
          <Link to=''><img ... /></Link>
      ...
    );
  ...
```

#### Customer - Danh sách sản phẩm theo Danh mục (listproduct)

##### Server

Cập nhật file `server/models/ProductDAO.js`:
```javascript
...
const ProductDAO = {
  ...,
  async selectByCatID(_cid) {
    const query = { 'category._id': _cid };
    const products = await Models.Product.find(query).exec();
    return products;
  }
};
...
```

Cập nhật file `server/api/customer.js`:
```javascript
...
// product
router.get('/products/category/:cid', async function (req, res) {
  const _cid = req.params.cid;
  const products = await ProductDAO.selectByCatID(_cid);
  res.json(products);
});
...
```

###### Kiểm tra với Postman
- (GET) `http://localhost:3000/api/customer/products/category/<id>`

##### Client-customer

Tạo file `client-customer/src/utils/withRouter.js`:
```javascript
// sử dụng withRouter trong class-component
import { useParams, useNavigate } from "react-router-dom";

function withRouter(Component) {
  return (props) => (
    <Component {...props} params={useParams()} navigate={useNavigate()} />
  );
}
export default withRouter;
```

Tạo file `client-customer/src/components/ProductComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: []
    };
  }
  render() {
    const prods = this.state.products.map((item) => {
      return (
        <div key={item._id} className="inline">
          <figure>
            <Link to=''><img src={"data:image/jpg;base64," + item.image} width="300px" height="300px" alt="" /></Link>
            <figcaption className="text-center">{item.name}<br />Price: {item.price}</figcaption>
          </figure>
        </div>
      );
    });
    return (
      <div className="text-center">
        <h2 className="text-center">LIST PRODUCTS</h2>
        {prods}
      </div>
    );
  }
  componentDidMount() { // chạy lần đầu khi truy cập /product/...
    const params = this.props.params;
    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    }
  }
  componentDidUpdate(prevProps) { // chạy khi có thay đổi đường dẫn /product/...
    const params = this.props.params;
    if (params.cid && params.cid !== prevProps.params.cid) {
      this.apiGetProductsByCatID(params.cid);
    }
  }
  // apis
  apiGetProductsByCatID(cid) {
    axios.get('/api/customer/products/category/' + cid).then((res) => {
      const result = res.data;
      this.setState({ products: result });
    });
  }
}
export default withRouter(Product);
```

Cập nhật file `client-customer/src/components/MenuComponent.js`:
```javascript
...
class Menu extends Component {
  ...
  render() {
    ...
      <li key={item._id} className="menu"><Link to={'/product/category/' + item._id}>{item.name}</Link></li>
    ...
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
import Product from './ProductComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/product/category/:cid' element={<Product />} />
        </Routes>
      ...
    );
  }
}
```

#### Customer - Tìm kiếm sản phẩm (search)

##### Server

Cập nhật file `server/models/ProductDAO.js`:
```javascript
...
const ProductDAO = {
  ...,
  async selectByKeyword(keyword) {
    const query = { name: { $regex: new RegExp(keyword, "i") } };
    const products = await Models.Product.find(query).exec();
    return products;
  }
};
...
```

Cập nhật file `server/api/customer.js`:
```javascript
...
// product
router.get('/products/search/:keyword', async function (req, res) {
  const keyword = req.params.keyword;
  const products = await ProductDAO.selectByKeyword(keyword);
  res.json(products);
});
...
```

###### Kiểm tra với Postman
- (GET) `http://localhost:3000/api/customer/products/search/<keyword>`

##### Client-customer

Cập nhật file `client-customer/src/components/MenuComponent.js`:
```javascript
...
import withRouter from '../utils/withRouter';

class Menu extends Component {
  constructor(props) {
    ...
    this.state = {
      ...,
      txtKeyword: ''
    };
  }
  render() {
    ...
    return (
      ...
        <form className="search">
          <input type="search" placeholder="Enter keyword" className="keyword" value={this.state.txtKeyword} onChange={(e) => { this.setState({ txtKeyword: e.target.value }) }} />
          <input type="submit" value="SEARCH" onClick={(e) => this.btnSearchClick(e)} />
        </form>
      ...
    );
  }
  // event-handlers
  btnSearchClick(e) {
    e.preventDefault();
    this.props.navigate('/product/search/' + this.state.txtKeyword);
  }
  ...
}
export default withRouter(Menu);
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/product/search/:keyword' element={<Product />} />
        </Routes>
      ...
    );
  }
}
```

Cập nhật file `client-customer/src/components/ProductComponent.js`:
```javascript
...
class Product extends Component {
  ...
  componentDidMount() { // lần đầu: /product/...
    ...
    if (params.cid) {
      ...
    } else if (params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    }
  }
  componentDidUpdate(prevProps) { // thay đổi: /product/...
    ...
    if (params.cid && params.cid !== prevProps.params.cid) {
      ...
    } else if (params.keyword && params.keyword !== prevProps.params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    }
  }
  // apis
  apiGetProductsByKeyword(keyword) {
    axios.get('/api/customer/products/search/' + keyword).then((res) => {
      const result = res.data;
      this.setState({ products: result });
    });
  }
  ...
}
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/` ⇒ nhập KEYWORD và nhấn nút SEARCH

#### Customer - Chi tiết sản phẩm (details)

##### Server

Cập nhật file `server/api/customer.js`:
```javascript
...
// product
router.get('/products/:id', async function (req, res) {
  const _id = req.params.id;
  const product = await ProductDAO.selectByID(_id);
  res.json(product);
});
...
```

###### Kiểm tra với Postman
- (GET) `http://localhost:3000/api/customer/products/<id>`

##### Client-customer

Tạo file `client-customer/src/components/ProductDetailComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import withRouter from '../utils/withRouter';

class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null
    };
  }
  render() {
    const prod = this.state.product;
    if (prod != null) {
      return (
        <div className="align-center">
          <h2 className="text-center">PRODUCT DETAILS</h2>
          <figure className="caption-right">
            <img src={"data:image/jpg;base64," + prod.image} width="400px" height="400px" alt="" />
            <figcaption>
              <form>
                <table>
                  <tbody>
                    <tr>
                      <td align="right">ID:</td>
                      <td>{prod._id}</td>
                    </tr>
                    <tr>
                      <td align="right">Name:</td>
                      <td>{prod.name}</td>
                    </tr>
                    <tr>
                      <td align="right">Price:</td>
                      <td>{prod.price}</td>
                    </tr>
                    <tr>
                      <td align="right">Category:</td>
                      <td>{prod.category.name}</td>
                    </tr>
                    <tr>
                      <td align="right">Quantity:</td>
                      <td><input type="number" min="1" max="99" /></td>
                    </tr>
                    <tr>
                      <td></td>
                      <td><input type="submit" value="ADD TO CART" /></td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </figcaption>
          </figure>
        </div>
      );
    }
    return (<div />);
  }
  componentDidMount() {
    const params = this.props.params;
    this.apiGetProduct(params.id);
  }
  // apis
  apiGetProduct(id) {
    axios.get('/api/customer/products/' + id).then((res) => {
      const result = res.data;
      this.setState({ product: result });
    });
  }
}
export default withRouter(ProductDetail);
```

Cập nhật file `client-customer/src/components/HomeComponent.js`:
```javascript
...
class Home extends Component {
  ...
  render() {
    const newprods = this.state.newprods.map((item) => {
      return (
        ...
        <figure>
          <Link to={'/product/' + item._id}><img ... /></Link>
        ...
      );
    });
    const hotprods = this.state.hotprods.map((item) => {
      return (
        ...
        <figure>
          <Link to={'/product/' + item._id}><img ... /></Link>
        ...
      );
    });
    ...
```

Cập nhật file `client-customer/src/components/ProductComponent.js`:
```javascript
...
class Product extends Component {
  ...
  render() {
    const prods = this.state.products.map((item) => {
      return (
        ...
        <figure>
          <Link to={'/product/' + item._id}><img ... /></Link>
        ...
      );
    });
    ...
```

Cập nhật file `client-customer/src/components/MainComponent.js`:
```javascript
...
import ProductDetail from './ProductDetailComponent';

class Main extends Component {
  render() {
    return (
      ...
        <Routes>
          ...
          <Route path='/product/:id' element={<ProductDetail />} />
        </Routes>
      ...
    );
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/product/<id>`
