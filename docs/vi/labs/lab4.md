# Lab 04: MERN Stack - Mua Sắm Trực Tuyến (Admin - Quản lý Sản phẩm)

## MERN Stack

### Chức năng (Functionals)

#### Admin - Danh sách sản phẩm (listproduct)

##### Server

Tạo file `server/models/ProductDAO.js`:
```js
require('../utils/MongooseUtil');
const Models = require('./Models');

const ProductDAO = {
  async selectAll() {
    const query = {};
    const products = await Models.Product.find(query).exec();
    return products;
  }
};
module.exports = ProductDAO;
```

Cập nhật file `server/api/admin.js`:
```js
...
// daos
const ProductDAO = require('../models/ProductDAO');
...
// product
router.get('/products', JwtUtil.checkToken, async function (req, res) {
  // get data
  var products = await ProductDAO.selectAll();
  // pagination
  const sizePage = 4;
  const noPages = Math.ceil(products.length / sizePage);
  var curPage = 1;
  if (req.query.page) curPage = parseInt(req.query.page); // /products?page=xxx
  const offset = (curPage - 1) * sizePage;
  products = products.slice(offset, offset + sizePage);
  // return
  const result = { products: products, noPages: noPages, curPage: curPage };
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (GET) `http://localhost:3000/api/admin/products?page=1`
- Headers: `"x-access-token": <admin-token>`
  - Kết quả:
  ```json
  {
      "products": [
          {
              "_id": "6288bb8505f9bb7c9f45cc18",
              "name": "iPad Air",
              "price": 10,
              "image": "/9j/4AAQSkZJRg...",
              "cdate": "1653128201479",
              "category": {
                  "_id": "6288b164708fabf8ab29ca0a",
                  "name": "iPad"
              }         
          },
          {
              "_id": "6288bc0940a1d1225e22805d",
              "name": "iPad Mini",
              "price": 20,
              "image": "/9j/4AAQSkZJRg...",
              "cdate": "1653128201479Z",
              "category": {
                  "_id": "6288b164708fabf8ab29ca0a",
                  "name": "iPad"
              }         
          },
          {
              "_id": "6288bd295ddf350614f2a916",
              "name": "iPad Pro",
              "price": 30,
              "image": "/9j/4AAQSkZJRg...",
              "cdate": "1653128489604",
              "category": {
                  "_id": "6288b164708fabf8ab29ca0a",
                  "name": "iPad"
              }         
          },
          {
              "_id": "6288bdda3afd8004d22ad823",
              "name": "iPhone 11 Pro Max",
              "price": 40,
              "image": "/9j/4AAQSkZJRg...",
              "cdate": "1653128666350",
              "category": {
                  "_id": "6288b174708fabf8ab29ca0d",
                  "name": "iPhone"
              }         
          }
      ],
      "noPages": 1,
      "curPage": 1
  }
  ```

##### Client-admin

Cập nhật file `client-admin/src/components/MainComponent.js`:
```js
...
import Product from './ProductComponent';

class Main extends Component {
  ...
  render() {
    ...
    return (
      ...
        <Routes>
          ...
          <Route path='/admin/product' element={<Product />} />
        </Routes>
      ...
    );
  }
}
...
```

Cập nhật file `client-admin/src/components/MenuComponent.js`:
```js
...
class Menu extends Component {
  ...
  render() {
    return (
      ...
      <ul className="menu">
        ...
        <li className="menu"><Link to='/admin/product'>Product</Link></li>
        ...
      </ul>
      ...
    );
  }
}
...
```

Tạo file `client-admin/src/components/ProductComponent.js`:
```js
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null
    };
  }
  render() {
    const prods = this.state.products.map((item) => {
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trItemClick(item)}>
          <td>{item._id}</td>
          <td>{item.name}</td>
          <td>{item.price}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.category.name}</td>
          <td><img src={"data:image/jpg;base64," + item.image} width="100px" height="100px" alt="" /></td>
        </tr>
      );
    });
    const pagination = Array.from({ length: this.state.noPages }, (_, index) => {
      if ((index + 1) === this.state.curPage) {
        return (<span key={index}>| <b>{index + 1}</b> |</span>);
      } else {
        return (<span key={index} className="link" onClick={() => this.lnkPageClick(index + 1)}>| {index + 1} |</span>);
      }
    });
    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">PRODUCT LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Creation date</th>
                <th>Category</th>
                <th>Image</th>
              </tr>
              {prods}
              <tr>
                <td colSpan="6">{pagination}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="inline" />
        <ProductDetail item={this.state.itemSelected} curPage={this.state.curPage} updateProducts={this.updateProducts} />
        <div className="float-clear" />
      </div>
    );
  }
  updateProducts = (products, noPages) => { // arrow-function
    this.setState({ products: products, noPages: noPages });
  }
  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }
  // event-handlers
  lnkPageClick(index) {
    this.apiGetProducts(index);
  }
  trItemClick(item) {
    this.setState({ itemSelected: item });
  }
  // apis
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + page, config).then((res) => {
      const result = res.data;
      this.setState({ products: result.products, noPages: result.noPages, curPage: result.curPage });
    });
  }
}
export default Product;
```

Tạo file `client-admin/src/components/ProductDetailComponent.js`:
```js
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: 0,
      cmbCategory: '',
      imgProduct: '',
    };
  }
  render() {
    const cates = this.state.categories.map((cate) => {
      if (this.props.item != null) {
        return (<option key={cate._id} value={cate._id} selected={cate._id === this.props.item.category._id}>{cate.name}</option>);
      } else {
        return (<option key={cate._id} value={cate._id}>{cate.name}</option>);
      }
    });
    return (
      <div className="float-right">
        <h2 className="text-center">PRODUCT DETAIL</h2>
        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td><input type="text" value={this.state.txtID} onChange={(e) => { this.setState({ txtID: e.target.value }) }} readOnly={true} /></td>
              </tr>
              <tr>
                <td>Name</td>
                <td><input type="text" value={this.state.txtName} onChange={(e) => { this.setState({ txtName: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td>Price</td>
                <td><input type="text" value={this.state.txtPrice} onChange={(e) => { this.setState({ txtPrice: e.target.value }) }} /></td>
              </tr>
              <tr>
                <td>Image</td>
                <td><input type="file" name="fileImage" accept="image/jpeg, image/png, image/gif" onChange={(e) => this.previewImage(e)} /></td>
              </tr>
              <tr>
                <td>Category</td>
                <td><select onChange={(e) => { this.setState({ cmbCategory: e.target.value }) }}>{cates}</select></td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="submit" value="ADD NEW" onClick={(e) => this.btnAddClick(e)} />
                  <input type="submit" value="UPDATE" onClick={(e) => this.btnUpdateClick(e)} />
                  <input type="submit" value="DELETE" onClick={(e) => this.btnDeleteClick(e)} />
                </td>
              </tr>
              <tr>
                <td colSpan="2"><img src={this.state.imgProduct} width="300px" height="300px" alt="" /></td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
  componentDidMount() {
    this.apiGetCategories();
  }
  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name,
        txtPrice: this.props.item.price,
        cmbCategory: this.props.item.category._id,
        imgProduct: 'data:image/jpg;base64,' + this.props.item.image
      });
    }
  }
  // event-handlers
  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result });
      }
      reader.readAsDataURL(file);
    }
  }
  // apis
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    });
  }
}
export default ProductDetail;
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/product`

#### Admin - Thêm sản phẩm (addproduct)

##### Server

Cập nhật file `server/models/CategoryDAO.js`:
```js
...
const CategoryDAO = {
  ...,
  async selectByID(_id) {
    const category = await Models.Category.findById(_id).exec();
    return category;
  }
};
...
```

Cập nhật file `server/models/ProductDAO.js`:
```js
...
const ProductDAO = {
  ...,
  async insert(product) {
    const mongoose = require('mongoose');
    product._id = new mongoose.Types.ObjectId();
    const result = await Models.Product.create(product);
    return result;
  }
};
...
```

Cập nhật file `server/api/admin.js`:
```js
...
// product
router.post('/products', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const now = new Date().getTime(); // milliseconds
  const category = await CategoryDAO.selectByID(cid);
  const product = { name: name, price: price, image: image, cdate: now, category: category };
  const result = await ProductDAO.insert(product);
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (POST) `http://localhost:3000/api/admin/products`
- Headers: `"x-access-token": <token>`
- Body (raw+JSON): 
  ```json
  {
      "name": "iWatch S7",
      "price": 130,
      "category": "644279d8146cdb5d63250036",
      "image": "/9j/4AAQSkZJRgABAQEAAAAAAAD/..."
  }
  ```
  > Lưu ý: "image" là chuỗi base64 của ảnh. Bạn có thể lấy bằng cách dùng FileReader để đọc file ảnh và chuyển sang base64 hoặc bỏ qua image.

  > Lưu ý: category là id của category. Bạn có thể lấy bằng cách dùng API get categories hoặc kiểm tra id category bằng MongoDB Compass hoặc MongoDB Atlas.

  - Kết quả:
  ```json
  {
    "_id": "6a8ad4eca96b824a7b91a27f",
    "name": "iWatch S7",
    "price": 130,
    "cdate": 1787483372492,
    "category": {
        "_id": "6a8aceb3a96b824a7b91a27a",
        "name": "Watch"
    }
  }
  ```


##### Client-admin

Cập nhật file `client-admin/src/components/ProductDetailComponent.js`:
```js
...
class ProductDetail extends Component {
  ...
  // event-handlers
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, ''); // remove "data:image/...;base64,"
    if (name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPostProduct(prod);
    } else {
      alert('Vui lòng nhập Tên, Giá, Danh mục và Hình ảnh');
    }
  }
  // apis
  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/products', prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('THÊM THÀNH CÔNG!');
        this.apiGetProducts();
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + this.props.curPage, config).then((res) => {
      const result = res.data;
      this.props.updateProducts(result.products, result.noPages);
    });
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/products`

#### Admin - Cập nhật sản phẩm (updateproduct)

##### Server

Cập nhật file `server/models/ProductDAO.js`:
```js
...
const ProductDAO = {
  ...,
  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
  },
  async update(product) {
    const newvalues = { name: product.name, price: product.price, image: product.image, category: product.category };
    const result = await Models.Product.findByIdAndUpdate(product._id, newvalues, { new: true });
    return result;
  }
};
...
```

Cập nhật file `server/api/admin.js`:
```js
...
// product
router.put('/products', JwtUtil.checkToken, async function (req, res) { // [!code error] 
  const _id = req.params.id; // [!code error]
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const now = new Date().getTime(); // milliseconds
  const category = await CategoryDAO.selectByID(cid);
  const product = { _id: _id, name: name, price: price, image: image, cdate: now, category: category };
  const result = await ProductDAO.update(product);
  res.json(result);
});
...
```

::: danger LỖI
2 đoạn code trên lỗi. Hướng dẫn và giải thích tại [đây](/vi/troubleshooting/lab4-put-product).
:::

###### Kiểm tra với Postman
- (PUT) `http://localhost:3000/api/admin/products/<id>`
- Headers: `"x-access-token": <token>`
- Body (raw+JSON): 
```json
{
    "name": "iWatch S7",
    "price": 130,
    "category": "644279d8146cdb5d63250036",
    "image": "/9j/4AAQSkZJRgABAQEAAAAAAAD/..."
}
```

  > Lưu ý: "image" là chuỗi base64 của ảnh. Bạn có thể lấy bằng cách dùng FileReader để đọc file ảnh và chuyển sang base64 hoặc bỏ qua image.

  > Lưu ý: category là id của category. Bạn có thể lấy bằng cách dùng API get categories hoặc kiểm tra id category bằng MongoDB Compass hoặc MongoDB Atlas.

  - Kết quả:
  ```json
  {
    "_id": "6a8ad4eca96b824a7b91a27f",
    "name": "iWatch S7",
    "price": 130,
    "cdate": 1787483372492,
    "category": {
        "_id": "6a8aceb3a96b824a7b91a27a",
        "name": "Watch"
    }
  }
  ```

##### Client-admin

Cập nhật file `client-admin/src/components/ProductDetailComponent.js`:

```js
...
class ProductDetail extends Component {
  ...
  // event-handlers
  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, ''); // remove "data:image/...;base64,"
    if (id && name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPutProduct(id, prod);
    } else {
      alert('Vui lòng nhập đầy đủ ID, Tên, Giá, Danh mục và Hình ảnh');
    }
  }
  // apis
  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/products/' + id, prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('CẬP NHẬT THÀNH CÔNG!');
        this.apiGetProducts();
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/product`

#### Admin - Xóa sản phẩm (deleteproduct)

##### Server

Cập nhật file `server/models/ProductDAO.js`:
```js
...
const ProductDAO = {
  ...,
  async delete(_id) {
    const result = await Models.Product.findByIdAndRemove(_id);
    return result;
  }
};
...
```

Cập nhật file `server/api/admin.js`:
```js
...
// product
router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await ProductDAO.delete(_id);
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (DELETE) `http://localhost:3000/api/admin/products/<id>`
  - Headers: `"x-access-token": <token>`
  > Lưu ý: `<id>` là id của product muốn xóa.
  Ví dụ `id` sản phẩm là `6288bdda3afd8004d22ad823` thì URL sẽ là `http://localhost:3000/api/admin/products/6288bdda3afd8004d22ad823`
  - Kết quả: 
  ```json
  {
      "_id": "6288bdda3afd8004d22ad823",
      "name": "iPhone 11 Pro Max",
      "price": 40,
      "cdate": 1653128666350,
      "category": {
          "_id": "6288b174708fabf8ab29ca0d",
          "name": "iPhone"
      }
  }
  ```

##### Client-admin

Cập nhật file `client-admin/src/components/ProductDetailComponent.js`:
```js
...
class ProductDetail extends Component {
  ...
  // event-handlers
  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteProduct(id);
      } else {
        alert('Vui lòng nhập ID');
      }
    }
  }
  // apis
  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/products/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('XÓA THÀNH CÔNG!');
        this.apiGetProducts();
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
  apiGetProducts() {
    ...
    axios.get('/api/admin/products?page=' + this.props.curPage, config).then((res) => {
      ...
      if (result.products.length !== 0) {
        this.props.updateProducts(result.products, result.noPages);
      } else {
        axios.get('/api/admin/products?page=' + (this.props.curPage - 1), config).then((res) => {
          const result = res.data;
          this.props.updateProducts(result.products, result.noPages);
        });
      }
    });
  }
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/product`
