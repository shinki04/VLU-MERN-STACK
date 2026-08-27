# Lab 03: MERN Stack - Shopping Online (Admin - Category Management)

## MERN Stack

### Functionals

#### Admin - listcategory

##### Server

Update `server/models/CategoryDAO.js` file:
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

Update `server/api/admin.js` file:
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

###### Test with Postman
- (GET) `http://localhost:3000/api/admin/categories`
  - Headers: `"x-access-token": <admin-token>`

  - Result:
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
    If the returned result is: 
    ```json
    {
      "success": false,
      "message": "Auth token is not supplied"
    }
    ```
    Please check Headers: `"x-access-token": <admin-token>`.
    
    Here, `<admin-token>` is obtained by logging in as admin through Postman:
    - **Method:** `POST`
    - **URL:** `http://localhost:3000/api/admin/login`
    - **Body (raw + JSON):**
      ```json
      {
        "username": "admin",
        "password": "123"
      }
      ```
    - **Response:** Copy the `token` string returned in the successful login response.
    
    See detailed instructions [here](/en/labs/lab2.md#test-with-postman) or see how to fix [token authentication errors in the Troubleshooting page](/en/troubleshooting/token-error.md).
    :::

##### Client-admin

Update `client-admin/src/components/MainComponent.js` file:
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

Update `client-admin/src/components/MenuComponent.js` file:
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

Create `client-admin/src/components/CategoryComponent.js` file:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';

class Category extends Component {
  static contextType = MyContext; // use this.context to access global state
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

Create `client-admin/src/components/CategoryDetailComponent.js` file:
```javascript
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext; // use this.context to access global state
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

###### Test on Browser
- `http://localhost:3001/admin/category`

#### Admin - addcategory

##### Server

Update `server/models/CategoryDAO.js` file:
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

Update `server/api/admin.js` file:
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

###### Test with Postman
- (POST) `http://localhost:3000/api/admin/categories`
- Headers: `"x-access-token": <admin-token>`
- Body (raw+JSON): 
```json
{
  "name": "Watch"
}
```
- Result: 
```json
{
    "_id": "6288b164708fabf8ab29ca0a",
    "name": "Watch"
}
```

##### Client-admin

Update `client-admin/src/components/CategoryComponent.js` file:
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

Update `client-admin/src/components/CategoryDetailComponent.js` file:
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
  # event-handlers
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    if (name) {
      const cate = { name: name };
      this.apiPostCategory(cate);
    } else {
      alert('Please enter category name');
    }
  }
  # apis
  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('ADD SUCCESS!');
        this.apiGetCategories();
      } else {
        alert('AN ERROR OCCURRED!');
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

###### Test on Browser
- `http://localhost:3001/admin/category`

#### Admin - updatecategory

##### Server

Update `server/models/CategoryDAO.js` file:
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

Update `server/api/admin.js` file:
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

###### Test with Postman
- (PUT) `http://localhost:3000/api/admin/categories/<id>`
- Headers: `"x-access-token": <token>`
- Body (raw+JSON): 
```json
{
  "name": "Watch2"
}
```
  - Result: 
```json
{
    "_id": "6288b164708fabf8ab29ca0a",
    "name": "Watch2"
}
```

##### Client-admin

Update `client-admin/src/components/CategoryDetailComponent.js` file:
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
  # event-handlers
  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    if (id && name) {
      const cate = { name: name };
      this.apiPutCategory(id, cate);
    } else {
      alert('Please enter ID and Name');
    }
  }
  # apis
  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('UPDATE SUCCESS!');
        this.apiGetCategories();
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
- `http://localhost:3001/admin/category`

#### Admin - deletecategory

##### Server

Update `server/models/CategoryDAO.js` file:
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

Update `server/api/admin.js` file:
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

###### Test with Postman
- (DELETE) `http://localhost:3000/api/admin/categories/<id>`
- Headers: `"x-access-token": <token>`
  - For example, if my Category id is `6a8aceb8a96b824a7b91a27b`, then the URL will be `http://localhost:3000/api/admin/categories/6a8aceb8a96b824a7b91a27b`
  - Result: 
  ```json
  {
      "_id": "6288b164708fabf8ab29ca0a",
      "name": "Watch2"
  }
  ```
  > If the category was deleted previously, the returned result will be `null`

##### Client-admin

Update `client-admin/src/components/CategoryDetailComponent.js` file:
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
  # event-handlers
  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('ARE YOU SURE?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        alert('Please enter ID');
      }
    }
  }
  # apis
  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('DELETE SUCCESS!');
        this.apiGetCategories();
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
- `http://localhost:3001/admin/category`
