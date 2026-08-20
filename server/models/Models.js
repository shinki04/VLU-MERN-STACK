const mongoose = require("mongoose");

// Schemas
const AdminSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
  },
  { versionKey: false },
);

const CategorySchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  { versionKey: false },
);

const CustomerSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    name: String,
    phone: String,
    email: String,
    active: Number,
    token: String,
  },
  { versionKey: false },
);

const ProductSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    image: String,
    cdate: Number,
    category: CategorySchema,
  },
  { versionKey: false },
);

const ItemSchema = new mongoose.Schema(
  {
    product: ProductSchema,
    quantity: Number,
  },
  { versionKey: false, _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    cdate: Number,
    total: Number,
    status: String,
    customer: CustomerSchema,
    items: [ItemSchema],
  },
  { versionKey: false },
);

// Models
const Admin = mongoose.model("Admin", AdminSchema);
const Category = mongoose.model("Category", CategorySchema);
const Customer = mongoose.model("Customer", CustomerSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

module.exports = { Admin, Category, Customer, Product, Order };
