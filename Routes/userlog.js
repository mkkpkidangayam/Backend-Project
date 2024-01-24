const express = require("express");
const router = express.Router();
const controller = require("../controller/userForm");
const { authentication } = require("../middleware/authentication");

router.route("/signup").post(controller.userSignUp);
router.route("/login").post(controller.login);
router.route("/logout").post(controller.logout);
router.route("/delete_account/:id").delete(authentication, controller.deleteUserAccount);

module.exports = router;
