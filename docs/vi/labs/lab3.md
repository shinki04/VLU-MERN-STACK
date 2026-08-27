# Lab 03: MERN Stack - Mua Sắm Trực Tuyến (Admin - Quản lý Danh mục)

## MERN Stack

### Chức năng (Functionals)

#### Admin - Danh sách danh mục (listcategory)

##### Server

Cập nhật file `server/models/CategoryDAO.js`:
```javascript
require('../utils/MongooseUtil');
const Models = require('./Models');

const CategoryDAO = {
  async selectAll() {
    const query = {};
    const categories = await Models.Category.find(query).exec();
    return categories;
  }
};
module.exports = CategoryDAO;
```

Cập nhật file `server/api/admin.js`:
```javascript
...
// daos
const CategoryDAO = require('../models/CategoryDAO');
...
// category
router.get('/categories', JwtUtil.checkToken, async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});
...
```

###### Kiểm tra với Postman
- (GET) `http://localhost:3000/api/admin/categories`
  - Headers: `"x-access-token": <admin-token>`

  - Kết quả:
    ```json
    [
      {
          "_id": "6288b164708fabf8ab29ca0a",
          "name": "iPad"
      },
      {
          "_id": "6288b174708fabf8ab29ca0d",
          "name": "iPhone"
      },
      {
          "_id": "6288b180708fabf8ab29ca10",
          "name": "Macbook"
      }
    ]
    ```

    ::: warning WARNING
    Nếu kết quả trả về là: 
    ```json
    {
      "success": false,
      "message": "Auth token is not supplied"
    }
    ```
    Vui lòng kiểm tra lại Headers: `"x-access-token": <admin-token>`.
    
    Trong đó, `<admin-token>` được lấy bằng cách thực hiện đăng nhập tài khoản admin qua Postman:
    - **Method:** `POST`
    - **URL:** `http://localhost:3000/api/admin/login`
    - **Body (raw + JSON):**
      ```json
      {
        "username": "admin",
        "password": "123"
      }
      ```
    - **Response:** Sao chép chuỗi `token` trả về từ kết quả đăng nhập thành công.
    
    Xem chi tiết hướng dẫn [tại đây](/vi/labs/lab2.md#kiem-tra-voi-postman) hoặc xem cách sửa [lỗi xác thực token ở trang Khắc phục sự cố](/vi/troubleshooting/token-error.md).
    :::

##### Client-admin

Cập nhật file `client-admin/src/components/MainComponent.js`:
```javascript
...
import Category from './CategoryComponent';

class Main extends Component {
  ...
  render() {
    ...
    return (
      ...
        <Routes>
          ...
          <Route path='/admin/category' element={<Category />} />
        </Routes>
      ...
    );
  }
}
...
```

Cập nhật file `client-admin/src/components/MenuComponent.js`:
```javascript
...
class Menu extends Component {
  ...
  render() {
    return (
      ...
      <div className="float-left">
        <ul className="menu">
          ...
          <li className="menu"><Link to='/admin/category'>Category</Link></li>
          ...
        </ul>
      ...
    );
  }
}
...
```

Tạo file `client-admin/src/components/CategoryComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';

class Category extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null
    };
  }
  render() {
    const cates = this.state.categories.map((item) => {
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trItemClick(item)}>
          <td>{item._id}</td>
          <td>{item.name}</td>
        </tr>
      );
    });
    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">CATEGORY LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
              </tr>
              {cates}
            </tbody>
          </table>
        </div>
        <div className="inline" />
        <CategoryDetail item={this.state.itemSelected} />
        <div className="float-clear" />
      </div>
    );
  }
  componentDidMount() {
    this.apiGetCategories();
  }
  // event-handlers
  trItemClick(item) {
    this.setState({ itemSelected: item });
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
export default Category;
```

Tạo file `client-admin/src/components/CategoryDetailComponent.js`:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext; // sử dụng this.context để truy cập global state
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: ''
    };
  }
  render() {
    return (
      <div className="float-right">
        <h2 className="text-center">CATEGORY DETAIL</h2>
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
                <td></td>
                <td>
                  <input type="submit" value="ADD NEW" />
                  <input type="submit" value="UPDATE" />
                  <input type="submit" value="DELETE" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      this.setState({ txtID: this.props.item._id, txtName: this.props.item.name });
    }
  }
}
export default CategoryDetail;
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/category`

#### Admin - Thêm danh mục (addcategory)

##### Server

Cập nhật file `server/models/CategoryDAO.js`:
```javascript
...
const CategoryDAO = {
  ...,
  async insert(category) {
    const mongoose = require('mongoose');
    category._id = new mongoose.Types.ObjectId();
    const result = await Models.Category.create(category);
    return result;
  }
};
...
```

Cập nhật file `server/api/admin.js`:
```javascript
...
// category
router.post('/categories', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const category = { name: name };
  const result = await CategoryDAO.insert(category);
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (POST) `http://localhost:3000/api/admin/categories`
- Headers: `"x-access-token": <admin-token>`
- Body (raw+JSON): 
```json
{
  "name": "Watch"
}
```
- Kết quả: 
```json
{
    "_id": "6288b164708fabf8ab29ca0a",
    "name": "Watch"
}
```
##### Client-admin

Cập nhật file `client-admin/src/components/CategoryComponent.js`:
```javascript
...
class Category extends Component {
  ...
  render() {
    ...
    return (
      <div>
        ...
        <CategoryDetail item={this.state.itemSelected} updateCategories={this.updateCategories} />
        ...
      </div>
    );
  }
  updateCategories = (categories) => { // arrow-function
    this.setState({ categories: categories });
  }
  ...
}
...
```

Cập nhật file `client-admin/src/components/CategoryDetailComponent.js`:
```javascript
...
class CategoryDetail extends Component {
  ...
  render() {
    ...
    return (
      ...
        <input type="submit" value="ADD NEW" onClick={(e) => this.btnAddClick(e)} />
      ...
    );
  }
  // event-handlers
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    if (name) {
      const cate = { name: name };
      this.apiPostCategory(cate);
    } else {
      alert('Vui lòng nhập tên danh mục');
    }
  }
  // apis
  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('THÊM THÀNH CÔNG!');
        this.apiGetCategories();
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.props.updateCategories(result);
    });
  }
  ...
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/category`

#### Admin - Cập nhật danh mục (updatecategory)

##### Server

Cập nhật file `server/models/CategoryDAO.js`:
```javascript
...
const CategoryDAO = {
  ...,
  async update(category) {
    const newvalues = { name: category.name }
    const result = await Models.Category.findByIdAndUpdate(category._id, newvalues, { new: true });
    return result;
  }
};
...
```

Cập nhật file `server/api/admin.js`:
```javascript
...
// category
router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const category = { _id: _id, name: name };
  const result = await CategoryDAO.update(category);
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (PUT) `http://localhost:3000/api/admin/categories/<id>`
- Headers: `"x-access-token": <token>`
- Body (raw+JSON): 
```json
{
  "name": "Watch2"
}
```
  - Kết quả: 
```json
{
    "_id": "6288b164708fabf8ab29ca0a",
    "name": "Watch2"
}
```
##### Client-admin

Cập nhật file `client-admin/src/components/CategoryDetailComponent.js`:
```javascript
...
class CategoryDetail extends Component {
  ...
  render() {
    ...
    return (
      ...
        <input type="submit" value="UPDATE" onClick={(e) => this.btnUpdateClick(e)} />
      ...
    );
  }
  // event-handlers
  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    if (id && name) {
      const cate = { name: name };
      this.apiPutCategory(id, cate);
    } else {
      alert('Vui lòng nhập ID và Tên');
    }
  }
  // apis
  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('CẬP NHẬT THÀNH CÔNG!');
        this.apiGetCategories();
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
  ...
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/category`

#### Admin - Xóa danh mục (deletecategory)

##### Server

Cập nhật file `server/models/CategoryDAO.js`:
```javascript
...
const CategoryDAO = {
  ...,
  async delete(_id) {
    const result = await Models.Category.findByIdAndRemove(_id);
    return result;
  }
};
...
```

Cập nhật file `server/api/admin.js`:
```javascript
...
// category
router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await CategoryDAO.delete(_id);
  res.json(result);
});
...
```

###### Kiểm tra với Postman
- (DELETE) `http://localhost:3000/api/admin/categories/<id>`
- Headers: `"x-access-token": <token>`
  - Ví dụ Category id của tôi là `6a8aceb8a96b824a7b91a27b` thì URL sẽ là `http://localhost:3000/api/admin/categories/6a8aceb8a96b824a7b91a27b`.
  - Kết quả: 
  ```json
  {
      "_id": "6288b164708fabf8ab29ca0a",
      "name": "Watch2"
  }
  ```
  > Nếu sản phẩm đã bị xóa trước đó thì kết quả sẽ trả về `null`
##### Client-admin

Cập nhật file `client-admin/src/components/CategoryDetailComponent.js`:
```javascript
...
class CategoryDetail extends Component {
  ...
  render() {
    ...
    return (
      ...
        <input type="submit" value="DELETE" onClick={(e) => this.btnDeleteClick(e)} />
      ...
    );
  }
  // event-handlers
  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        alert('Vui lòng nhập ID');
      }
    }
  }
  // apis
  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('XÓA THÀNH CÔNG!');
        this.apiGetCategories();
      } else {
        alert('CÓ LỖI XẢY RA!');
      }
    });
  }
  ...
}
...
```

###### Kiểm tra trên Trình duyệt
- `http://localhost:3001/admin/category`
