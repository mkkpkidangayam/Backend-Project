const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment-timezone");

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [50, "Title cannot exceed 50 characters"],
    },
    description: {
      type: String,
      maxlength: [100, "Description cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["men", "women", "phone"],
    },
    createdAt: String,
    updatedAt: String,
  },
  {
    timestamps: true,
  }
);
productSchema.pre("save", async function (next) {
  const nowIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  this.createdAt = this.createdAt || nowIST;
  this.updatedAt = nowIST;
  return next();
});

module.exports = mongoose.model("products", productSchema);
