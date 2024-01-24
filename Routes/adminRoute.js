const express = require("express");
const router = express();
const { adminAuth } = require("../middleware/adminAuth");
const adminForm = require("../controller/adminForm");
const upload = require("../Upload/multer");

router.route("/admin/login").post(adminForm.adminLogin);
router.route("/admin/logout").post(adminForm.adminLogout);

router.route("/admin/user").get(adminAuth, adminForm.viewUsers);
router.route("/admin/user/:id").get(adminAuth, adminForm.viewUserById);

router.route("/admin/product").get(adminAuth, adminForm.viewProduct);
router.route("/admin/product/:id").get(adminAuth, adminForm.viewProductById);
router.route("/admin/product/category/:id").get(adminAuth, adminForm.productsCategory);

router.route("/admin/addproduct").post(adminAuth, upload.single("image"), adminForm.addProduct);
router.route("/admin/updateproduct/:id").put(adminAuth, upload.single("image"), adminForm.updateProduct);
router.route("/admin/deleteproduct").delete(adminAuth, adminForm.deleteProduct);

router.route("/admin/orderstatus").get(adminAuth,adminForm.orderStatus);
router.route("/admin/orders").get(adminAuth,adminForm.orderDetails);


module.exports = router;
