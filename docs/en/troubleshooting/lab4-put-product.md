# Fix Lab 4 Error

## Location of the Error

The error occurs in **Lab 4, page 9**, in the **product update** section.

The code block in the current guide:

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

### Cause

The error occurs because the route URL path definition and the way `id` is retrieved in the controller do not match.

In the code, `id` is retrieved using `req.params.id`, which means the ID must be passed directly in the URL path, e.g.:
```text
http://localhost:3000/api/admin/products/<id>
```
However, the route currently declares only `/products`, so Express does not know where the ID is in the path to populate `req.params.id`.

Therefore, we need to declare the route with `/:id` so that `req.params.id` can receive the value from the URL path:
```js
router.put('/products/:id', ...)
```
When configured this way, a request URL like:
```text
http://localhost:3000/api/admin/products/1
```
will correctly bind the value `1` to `req.params.id`.

## How to Fix

Change the route path from:

```js
router.put('/products', ...)
```

to:

```js
router.put('/products/:id', JwtUtil.checkToken, async function (req, res) { // [!code focus] [!code ++]
  const _id = req.params.id; // [!code focus] [!code ++]
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
```

After applying this fix, when updating a product with ID `1`, the request URL should be used as follows:

```text
PUT http://localhost:3000/api/admin/products/1
```

In this case, `req.params.id` will correctly resolve to `1`.
