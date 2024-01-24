const express = require("express");
const router = express();

const { authentication } = require("../middleware/authentication");
const userForm = require("../controller/userForm");
// const { route } = require("./userlog");

// UserForm All Routes 
router.route('/user/:id/updateuser').put(authentication, userForm.updateUserProfile)

router.route("/products").get(authentication, userForm.products);
router.route("/products/:id").get(authentication, userForm.productId);
router.route("/products/category/:id").get(authentication, userForm.productsCategory);

router.route("/:id/postcart").post(authentication, userForm.cartAdding);
router.route("/:id/getcart").get(authentication, userForm.displayCart);
router.route("/:id/deletecart").delete(authentication, userForm.removeFromCart);

router.route("/:id/addwishlist").post(authentication, userForm.addWishlist);
router.route("/:id/getwishlist").get(authentication, userForm.displayWishlist);
router.route("/:id/deletewishlist").delete(authentication, userForm.removeWishlist);

router.route("/:id/orderplacing").get(authentication, userForm.placingOrder);
router.route("/:id/payment").post(authentication, userForm.payment);

module.exports = router;
