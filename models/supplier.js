import mongoose from "mongoose";
import timestamps from "mongoose-timestamp";

const { Schema } = mongoose;

export const SupplierSchema = new Schema(
  {
    name: String,
    username: String,
    password: String,
    phone_number: String,
  },
  {
    collection: "suppliers",
  }
);
SupplierSchema.plugin(timestamps);

SupplierSchema.index({ createdAt: 1, updatedAt: 1 });

export const Supplier = mongoose.model("Supplier", SupplierSchema);
