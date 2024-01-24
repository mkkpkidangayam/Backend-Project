const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
      // required: [true, "Description is required"],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("products", productSchema);
