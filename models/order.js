import mongoose from "mongoose";
import timestamps from "mongoose-timestamp";

const { Schema } = mongoose;

export const OrderSchema = new Schema(
  {
    status: String,
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    description: String,
    due_date: String,
    actualization_date: String,
    paid: Number,
  },
  {
    collection: "orders",
  }
);

OrderSchema.plugin(timestamps);

OrderSchema.index({ createdAt: 1, updatedAt: 1 });

export const Order = mongoose.model("Order", OrderSchema);
