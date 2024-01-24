const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) =>
          joi.string().email().required().validate(value).error === undefined,
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [3, "Password must be at least 3 characters"],
    },
    wishlist: Array,
    cart: Array,
    order: Array,
  },
  {
    timestamps: true,
  }
);

const userValidationSchema = joi.object({
  username: joi.string().trim().max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(3).required(),
  wishlist: joi.array(),
  cart: joi.array(),
  order: joi.array(),
});

function validateUser(user) {
  return userValidationSchema.validate(user);
}

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  validateUser: validateUser,
};

// module.exports = { user: mongoose.model("User", userSchema), validateUser };
