const { User, validateUser } = require("../model/user");
const productModel = require("../model/product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { tryCatch } = require("../middleware/trycatchHandler");
const Razorpay = require("razorpay");

const { JWT_SECRET } = process.env;

// Sign Up
const userSignUp = tryCatch(async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { email } = req.body;

  const findEmail = await User.findOne({ email });

  if (findEmail) {
    return res.status(401).json({
      alert: "401 error",
      message: "Email already in use",
    });
  }

  const user = await User.create(req.body);

  return res.status(201).json({
    user,
    message: "User Created Successfully",
  });
});

// Login
const login = tryCatch(async (req, res) => {
  const { email, password } = req.body;
  const userDetails = await User.findOne({ email });

  if (!userDetails) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  const result = await bcrypt.compare(password, userDetails.password);

  if (!result) {
    return res.status(401).json({
      success: false,
      message: "Password is incorrect",
    });
  }

  const accessToken = jwt.sign(
    { email: email, id: userDetails.password },
    JWT_SECRET
  );

  res.status(202).cookie("token", accessToken).json({
    success: true,
    message: "Login Successfully",
    _id: userDetails._id,
  });
});

// Update User Profile
const updateUserProfile = tryCatch(async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    user: updatedUser,
  });
});

//LogOut
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// Delete User Account
const deleteUserAccount = tryCatch(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password. Account deletion failed.",
    });
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: "User account deleted successfully",
  });
});

// Show Products
const products = tryCatch(async (req, res) => {
  const productData = await productModel.find();
  if (!productData) {
    res.status(401).json({
      success: false,
      message: "No products available",
    });
  } else {
    res.status(201).json(productData);
  }
});

// Products By Id
const productId = tryCatch(async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const productsFind = await productModel.findById(id);
  if (!productsFind) {
    res.status(401).json({
      success: false,
      message: "Product Not Found",
    });
  } else {
    res.status(201).json(productsFind);
  }
});

// Products Category
const productsCategory = tryCatch(async (req, res) => {
  const ctgry = req.params.id;

  const categoryFind = await productModel.aggregate([
    {
      $match: { category: ctgry },
    },
  ]);

  if (!categoryFind || categoryFind.length === 0) {
    res.status(404).json({
      success: false,
      message: "Category not found",
    });
  } else {
    res.status(201).json(categoryFind);
  }
});

// add product to cart
const cartAdding = tryCatch(async (req, res) => {
  const { id: userid } = req.params;
  const addProduct = await productModel.findById(req.body._id);
  const checkUser = await User.findById(userid);

  if (!addProduct || !checkUser) {
    return res.status(404).json({
      success: false,
      message: "User id or product id is incorrect",
    });
  }

  // Check if the product already exists in the cart
  const existingProduct = checkUser.cart.find(
    (item) => item._id == req.body._id
  );

  if (existingProduct) {
    // If the product exists, increment the quantity
    existingProduct.quantity = (existingProduct.quantity || 1) + 1;
  } else {
    // If the product doesn't exist, add it to the cart with quantity 1
    checkUser.cart.push({
      ...addProduct.toObject(),
      quantity: 1,
    });
  }

  await checkUser.save();
  res.status(201).json(checkUser);
});

// view product from cart

const displayCart = tryCatch(async (req, res) => {
  const id = req.params.id;
  // console.log(id);

  const userCheck = await User.findById(id);
  // console.log(userCheck);

  if (!userCheck) {
    res.status(404).json({
      success: false,
      message: "Invalid Product",
    });
  } else {
    const cartData = userCheck.cart;
    res.status(201).json(cartData);
  }
});

// Delete from Cart
const removeFromCart = tryCatch(async (req, res) => {
  const { id: userId } = req.params;
  const { _id: productId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const { cart } = user;
  const productToRemove = cart.find((product) => product._id.equals(productId));

  if (!productToRemove) {
    return res.status(404).json({
      success: false,
      message: "Product not found in the cart",
    });
  }

  user.cart = cart.filter((product) => !product._id.equals(productId));
  const updatedUser = await user.save();

  return res.status(201).json({
    message: "Product successfully removed from the cart",
    data: updatedUser.cart,
  });
});

// add to wish list

const addWishlist = tryCatch(async (req, res) => {
  const userId = req.params.id;

  const addProduct = await productModel.findById(req.body._id);
  const checkUser = await User.findById(userId);

  if (!addProduct || !checkUser) {
    return res.status(404).json({
      success: false,
      message: "User id or Product id is incorrect",
    });
  }

  if (!checkUser.wishlist) {
    checkUser.wishlist = [];
  }

  const isExist = checkUser.wishlist.find(
    (item) => item._id.toString() === req.body._id.toString()
  );

  if (isExist) {
    return res.status(400).json({
      success: false,
      message: "Item is already in the wishlist",
    });
  } else {
    checkUser.wishlist.push(addProduct);
    await checkUser.save();
    return res.status(201).json({
      success: true,
      message: "Item added to the wishlist successfully",
      user: checkUser,
    });
  }
});

// view product from wishlist

const displayWishlist = tryCatch(async (req, res) => {
  const userId = req.params.id;

  const userCheck = await User.findById(userId);

  if (!userCheck) {
    res.status(404).json({
      success: false,
      message: "Invalid Product",
    });
  } else {
    const wishData = userCheck.wishlist;
    res.status(201).json(wishData);
  }
});

// delete wish list items

const removeWishlist = tryCatch(async (req, res) => {
  const userid = req.params.id;

  const user = await User.findById(userid);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const { wishlist } = user;
  const productRemove = wishlist.find((product) =>
    product._id.equals(req.body._id)
  );

  if (productRemove) {
    const updateWishlist = wishlist.filter(
      (product) => product !== productRemove
    );
    user.wishlist = updateWishlist;

    const updateUser = await user.save();

    res.status(201).json({
      message: "Product Successfully removed from wishlist",
      data: updateUser.wishlist,
    });
  } else {
    return res.status(404).json({
      success: false,
      message: "Product not fond in the wishlist",
    });
  }
});

//order placingOrder

const placingOrder = tryCatch(async function (req, res) {
  const userId = req.params.id;
  const userCheck = await User.findById(userId);

  if (!userCheck) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const { cart } = userCheck;

  if (cart.length === 0) {
    return res.status(404).json({
      success: false,
      message: "you have to add product to cart",
    });
  } else {
    const totalPrice = cart
      .reduce((accumulator, product) => {
        return accumulator + product.price;
      }, 0)
      .toFixed(2);

    return res.status(200).json({
      success: true,
      message: `the total amount you have to pay ${totalPrice}`,
      products: `${cart.length}, products`,
      data: cart,
    });
  }
});

//payment processing order
const payment = tryCatch(async function (req, res) {
  const userId = req.params.id;
  const amount = req.body.price;

  const userCheck = await User.findById(userId);

  const razorpay = new Razorpay({
    key_id: process.env.rzr_key_id,
    key_secret: process.env.rzr_key_secret,
  });

  if (!userCheck) {
    return res.status(404).json({
      success: false,
      message: "user not valid",
    });
  }

  const { cart } = userCheck;

  if (cart.length === 0) {
    return res.status(404).json({
      success: false,
      message: "you have to add product to cart",
    });
  }
  const totalPrice = cart
    .reduce((accumulator, product) => {
      return accumulator + product.price;
    }, 0)
  console.log("Total Price:", totalPrice);
  console.log("amount: ", amount);
  
  if (totalPrice === amount) {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "order_rcptid_10",
    };

    const order = await razorpay.orders.create(options);

    // Move cart items to order
    userCheck.order = userCheck.cart;

    // Empty the cart after successful payment
    userCheck.cart = [];

    await userCheck.save();

    return res.status(200).json({
      success: true,
      message: `you succesfully payed ${totalPrice}`,
      order,
      data: userCheck.order,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Enter the correct amount",
    });
  }
});

module.exports = {
  userSignUp,
  login,
  updateUserProfile,
  logout,
  deleteUserAccount,
  products,
  productId,
  productsCategory,
  cartAdding,
  displayCart,
  removeFromCart,
  addWishlist,
  displayWishlist,
  removeWishlist,
  placingOrder,
  payment,
};
