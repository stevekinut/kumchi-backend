import mongoose from "mongoose";
import timestamps from "mongoose-timestamp";

const { Schema } = mongoose;

export const VendorSchema = new Schema(
  {
    name: String,
    username: String,
    password: String,
    phone_number: String,
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        restock_level: Number,
        quantity: Number,
        price: Number,
      },
    ],
    sales: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        timestamp: String,
      },
    ],
  },
  {
    collection: "vendors",
  }
);
VendorSchema.plugin(timestamps);

VendorSchema.index({ createdAt: 1, updatedAt: 1 });

export const Vendor = mongoose.model("Vendor", VendorSchema);
