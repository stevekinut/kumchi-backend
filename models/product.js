import mongoose from "mongoose";
import timestamps from "mongoose-timestamp";
import mongooseAlgolia from "mongoose-algolia";
import dotenv from "dotenv";

dotenv.config();

const { Schema } = mongoose;

export const ProductSchema = new Schema(
  {
    name: String,
    image: String,
    sub_quantities: Number,
    suppliers: [
      {
        supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
        price: Number,
        restock_level: Number,
        quantity: Number,
      },
    ],
  },
  {
    collection: "products",
  }
);

// ProductSchema.plugin(mongooseAlgolia, {
//   appId: process.env.ALGOLIA_APP_ID,
//   apiKey: process.env.ALGOLIA_API_KEY,
//   indexName: process.env.ALGOLIA_INDEX_NAME,
// });

ProductSchema.index({ name: "text" });

ProductSchema.plugin(timestamps);

ProductSchema.index({ createdAt: 1, updatedAt: 1 });

export const Product = mongoose.model("Product", ProductSchema);

// Product.SyncToAlgolia(); //Clears the Algolia index for this schema and synchronizes all documents to Algolia (based on the settings defined in your plugin settings)
// Product.SetAlgoliaSettings({
//   searchableAttributes: ["name", "category"], //Sets the settings for this schema, see [Algolia's Index settings parameters](https://www.algolia.com/doc/api-client/javascript/settings#set-settings) for more info.
// });
