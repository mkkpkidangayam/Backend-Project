const { User } = require("../model/user");
const productModel = require("../model/product");
const { tryCatch } = require("../middleware/trycatchHandler");
const { signToken } = require("../middleware/jwt");
const cloudinary = require("../Upload/cloudinary");

// Admin login
const adminLogin = tryCatch(async (req, res) => {
  const adminCredentials = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  };

  const { username, password } = req.body;

  const isValidCredentials =
    username === adminCredentials.username &&
    password === adminCredentials.password;

  if (isValidCredentials) {
    // Assuming you have a user ID for the admin, replace 'adminUserId' with the actual user ID
    const token = await signToken('adminUserId');
    res.status(202).cookie("adminToken", token).json({
      success: true,
      message: "Login successful",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Incorrect username or password",
    });
  }
});

// Admin logout
const adminLogout = tryCatch((req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// View all users
const viewUsers = tryCatch(async (req, res) => {
  const users = await User.find();
  if (users) {
    res.status(200).json(users);
  }else{
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// View user by ID
const viewUserById = tryCatch(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  } else {
    res.status(200).json(user);
  }
});

// View all products
const viewProduct = tryCatch(async (req, res) => {
  const products = await productModel.find();

  if (products.length === 0) {
    res.status(400).send("Product list is empty");
  } else {
    res.status(200).json(products);
  }
});

// View product by ID
const viewProductById = tryCatch(async (req, res) => {
  const productId = req.params.id;
  const product = await productModel.findById(productId);

  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  } else {
    res.status(200).json(product);
  }
});

// View products by category
const productsCategory = tryCatch(async (req, res) => {
  const category = req.params.id;
  const productsInCategory = await productModel.aggregate([
    { $match: { category: category } },
  ]);

  if (productsInCategory.length === 0) {
    res.status(404).json({
      success: false,
      message: "No products found in the specified category",
    });
  } else {
    res.status(200).json(productsInCategory);
  }
});

// Add product
const addProduct = tryCatch(async (req, res) => {
  const { title, description, price, category } = req.body;
  const existingProduct = await productModel.findOne({ title: title });

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: "Product with the same title already exists",
    });
  }

  const uploadedImage = await cloudinary.uploader.upload(req.file.path);

  const newProduct = new productModel({
    title,
    description,
    price,
    category,
    image: uploadedImage.url,
  });

  await newProduct.save();

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    data: newProduct,
  });
});

// Update product
const updateProduct = tryCatch(async (req, res) => {
  const productId = req.params.id;
  const { title, description, price, category } = req.body;

  const existingProduct = await productModel.findOne({
    title: { $eq: title, $ne: null },
    _id: { $ne: productId },
  });

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: "Product with the same title already exists",
    });
  }

  const adding = req.file && (await cloudinary.uploader.upload(req.file.path));
  const product = await productModel.findById(productId);

  if (product) {
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.image = adding ? adding.url : product.image;

    await product.save();

    res.status(202).json({
      status: "Success",
      message: "Successfully updated the product",
      data: product,
    });
  } else {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});

// Delete product
const deleteProduct = tryCatch(async (req, res) => {
  const productId = req.body._id;

  const deletedProduct = await productModel.findByIdAndDelete(productId);

  if (!deletedProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: deletedProduct,
  });
});

// Order status
const orderStatus = tryCatch(async (req, res) => {
  const userDetails = await User.find();

  let totalOrderCount = 0;
  let totalOrderPrice = 0;

  userDetails.forEach((user) => {
    totalOrderCount += user.order.length;
    totalOrderPrice += user.order.reduce((acc, order) => acc + order.price, 0);
  });
  totalOrderPrice.toFixed(2);

  res.json({
    success: true,
    message: "User order details retrieved successfully.",
    data: {
      totalOrderCount,
      totalOrderPrice,
    },
  });
});

// Order details
const orderDetails = tryCatch(async (req, res) => {
  const userDetails = await User.find();

  let allOrders = [];

  userDetails.forEach((user) => {
    user.order.forEach((order) => {
      const orderWithUser = {
        userId: user._id,
        username: user.username,
        orderDetails: order,
      };
      allOrders.push(orderWithUser);
      allOrders = allOrders.concat(user.order);
    });
  });

  res.json({
    success: true,
    message: "User order details retrieved successfully.",
    data: allOrders,
  });
});




module.exports = {
  adminLogin,
  adminLogout,
  viewUsers,
  viewUserById,
  viewProduct,
  viewProductById,
  productsCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  orderStatus,
  orderDetails,
};