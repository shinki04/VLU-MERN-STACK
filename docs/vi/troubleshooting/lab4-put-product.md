# Sửa lỗi Lab 4

## Vị trí lỗi

Lỗi xuất hiện tại **Lab 4, trang 9**, phần **cập nhật sản phẩm**.

Đoạn code trong tài liệu hiện tại:

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

### Nguyên nhân

Lỗi xảy ra do cách khai báo URL và cách lấy `id` trong code không khớp nhau.

Trong code, `id` được lấy bằng `req.params.id`, nghĩa là id phải được truyền trực tiếp trên URL theo dạng:
```text
http://localhost:3000/api/admin/products/<id>
```
Tuy nhiên, route hiện tại lại chỉ khai báo `/products` nên Express không biết id nằm ở đâu để đưa vào `req.params.id`.

Do đó, cần khai báo route có thêm `/:id` để `req.params.id` nhận được giá trị từ URL:
```js
router.put('/products/:id', ...)
```
Khi đó, ví dụ với URL:
```text
http://localhost:3000/api/admin/products/1
```
thì `req.params.id` sẽ nhận giá trị 1.

## Cách khắc phục

Thay đổi route từ:

```js
router.put('/products', ...)
```

thành:

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

Sau khi sửa, khi cập nhật sản phẩm có `id` là `1`, URL sẽ được sử dụng như sau:

```text
PUT http://localhost:3000/api/admin/products/1
```

Trong trường hợp này, `req.params.id` sẽ nhận giá trị `1`.
