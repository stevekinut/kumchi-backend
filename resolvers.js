import { Product } from "./models/product.js";
import { Order } from "./models/order.js";
import { Vendor } from "./models/vendor.js";
import { Supplier } from "./models/supplier.js";

import dotenv from "dotenv";
import cloudinary from "cloudinary";

dotenv.config();

function omit(obj, ...props) {
  const result = { ...obj };
  props.forEach(function (prop) {
    delete result[prop];
  });
  return result;
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resolvers = {
  Supplier: {
    products: async (parent, args) => {
      let products = await Product.find({ "suppliers.supplier": parent.id });

      return products;
    },
    orders: async (parent, args) => {
      let orders = await Order.find({ supplier: parent.id })
        .populate("vendor")
        .populate("product");
      return orders;
    },
  },

  Order: {
    price: async (parent, args) => {
      let product = await Product.findById(parent?.product?.id);

      let price;

      product?.suppliers.forEach((supplier) => {
        if (supplier.supplier.toString() == parent.supplier.id) {
          price = supplier.price;
        }
      });

      return price;
    },
  },

  Vendor: {
    order_requests: async (parent, args) => {
      let orders = await Order.find({ vendor: parent.id })
        .populate("supplier")
        .populate("product");
      return orders;
    },
    products: async (parent, args) => {
      let _products = [];

      const getMeta = async (id) => {
        let meta = await Product.findById(id);
        return meta;
      };

      for (let i = 0; i < parent.products.length; i++) {
        const { restock_level, quantity, price, product } = parent.products[i];

        let _product = {
          restock_level,
          quantity,
          price,
          product: getMeta(product),
        };

        _products.push(_product);
      }

      return _products;
    },
  },

  Query: {
    getProducts: async (_, args) => {
      const products = await Product.find({}).populate("suppliers.supplier");
      return products;
    },

    getProduct: async (_, args) => {
      const products = await Product.findById(args?.id).populate(
        "suppliers.supplier"
      );
      return products;
    },

    getOrders: async (_, { supplier, vendor }) => {
      if (supplier) {
        let orders = await Order.find({ supplier })
          .populate("vendor")
          .populate("supplier")
          .populate("product");

        let _orders = [];

        orders.forEach((order) => {
          const {
            id,
            product,
            vendor,
            supplier,
            quantity,
            description,
            status,
            due_date,
            actualization_date,
            createdAt,
            updatedAt,
          } = order;
          let _order = {
            id,
            quantity,
            product,
            vendor,
            supplier,
            description,
            status,
            due_date,
            actualization_date,
            createdAt,
            updatedAt,
          };

          _orders.push(_order);
        });

        return _orders;
      } else if (vendor) {
        let orders = await Order.find({ vendor })
          .populate("vendor")
          .populate("supplier")
          .populate("product");
        return orders;
      } else {
        let orders = await Order.find({})
          .populate("vendor")
          .populate("supplier")
          .populate("product");
        return orders;
      }
    },

    getVendors: async (_, args) => {
      let vendors = await Vendor.find({})
        .populate("products.product")
        .populate("sales.product");

      return vendors;
    },

    getSupplier: async (_, { id, username, password }) => {
      if (id && !username && !password) {
        let supplier = await Supplier.findById(id);
        return supplier;
      } else if (!id && username && password) {
        let supplier = await Supplier.findOne({ username, password });
        return supplier;
      }
    },

    getVendor: async (_, { id, username, password }) => {
      if (id && !username && !password) {
        let _vendor = await Vendor.findById(id)
          .populate("products.product")
          .populate("sales.product");

        const {
          sales,
          name,
          username,
          password,
          phone_number,
          products,
          order_requests,
          createdAt,
        } = _vendor;

        const getPrice = (prod_id) => {
          let price;
          _vendor.products.forEach((product) => {
            console.log({
              1: product.product.id.toString(),
              2: prod_id,
            });
            if (product.product.id.toString() == prod_id) {
              price = product.price;
            } else {
              price = 0;
            }
          });

          console.log(price);

          return price;
        };

        let _sales = sales.map((sale) => {
          const { product, quantity, timestamp } = sale;
          return {
            price: getPrice(product.id.toString()),
            product,
            quantity,
            timestamp,
          };
        });

        const vendor = {
          id: _vendor.id,
          name,
          username,
          password,
          phone_number,
          products,
          order_requests,
          createdAt,
          sales: _sales,
        };

        return vendor;
      } else if (!id && username && password) {
        let vendor = await Vendor.findOne({ username, password })
          .populate("products.product")
          .populate("sales.product");
        return vendor;
      }
    },
  },

  Mutation: {
    addSupplier: async (_, args) => {
      const { username, password, phone_number, name } = args;

      let newSupplier = new Supplier({
        username,
        password,
        phone_number,
        name,
      });

      let supplier = newSupplier.save();
      return supplier;
    },

    addVendor: async (_, args) => {
      const { username, password, phone_number, name } = args;

      let newVendor = new Vendor({
        username,
        password,
        phone_number,
        name,
      });

      let vendor = newVendor.save();
      return vendor;
    },

    addProductVendor: async (_, args) => {
      const { vendor, restock_level, price, product } = args;

      Vendor.findById(vendor, (err, _vendor) => {
        if (err) return 0;

        let newProduct = {
          product,
          restock_level,
          price,
          quantity: 0,
        };

        let newProducts = [newProduct, ..._vendor.products];

        _vendor.products = newProducts;
        _vendor.save();
        return 1;
      });
    },

    addProduct: async (_, args) => {
      const {
        id,
        name,
        price,
        supplier,
        quantity,
        restock_level,
        sub_quantities,
      } = args;

      if (id && !name && !sub_quantities) {
        await Product.updateOne(
          {
            _id: id,
          },
          {
            $addToSet: {
              suppliers: {
                supplier,
                price,
                restock_level,
                quantity,
              },
            },
          }
        );
        let product = await Product.findById(id);
        return product;
      } else {
        let newProduct = new Product({
          name,
          sub_quantities,
          suppliers: [
            {
              supplier,
              price,
              restock_level,
              quantity,
            },
          ],
        });

        let product = newProduct.save();
        return product;
      }
      // cloudinary.v2.uploader
      //   .upload(image, {
      //     public_id: "",
      //     folder: "dev_hardware",
      //   })
      //   .then((res) => {
      //     console.log(res.url);
      //     let newProduct = new Product({
      //       category,
      //       image: res.url,
      //       name,
      //       price,
      //       quantity,
      //       restockLevel,
      //     });

      //     let product = newProduct.save();
      //     return product;
      //   });
    },

    createOrder: async (_, args) => {
      const { product, quantity, vendor, supplier, description, due_date } =
        args;

      let newOrder = new Order({
        status: "open",
        product,
        quantity,
        vendor,
        supplier,
        description,
        due_date,
      });

      let order = newOrder.save();
      return order;
    },

    updateOrder: async (_, args) => {
      const { id, status } = args;

      let order = await Order.findById(id).populate("product");

      switch (status) {
        case "disbursed":
          await Product.findById(order.product.id, function (err, _product) {
            let _updatedSuppliers = _product?.suppliers;

            _updatedSuppliers.forEach((supplier) => {
              if (supplier?.supplier.toString() == order.supplier.toString()) {
                supplier.quantity = supplier.quantity - order.quantity;
              }
            });

            _product.update(
              { suppliers: _updatedSuppliers },
              async (err, product) => {
                await Order.findByIdAndUpdate(id, { status });
                return 2;
              }
            );
          });
          break;

        case "closed":
          await Vendor.findById(
            order.vendor.toString(),
            async function (err, _vendor) {
              let _updatedProducts = _vendor?.products;

              _updatedProducts.forEach((_product) => {
                console.log({
                  1: _product?.product.id.toString(),
                  2: order.product.id.toString(),
                });
              });

              if (
                _updatedProducts.filter(
                  (_product) =>
                    _product?.product.id.toString() ==
                    order.product.id.toString()
                ).length > 0
              ) {
                let product = await Product.findById(order.product.id);

                _updatedProducts.forEach((_product) => {
                  console.log(_product?.product.id.toString());

                  if (
                    _product?.product.id.toString() ==
                    order.product.id.toString()
                  ) {
                    _product.quantity =
                      _product.quantity +
                      order.quantity * product?.sub_quantities;
                  }
                });

                _vendor.update(
                  {
                    products: _updatedProducts,
                  },
                  async function (err, doc) {
                    await Order.findByIdAndUpdate(id, { status });
                    return doc.modifiedCount;
                  }
                );
              }

              if (
                _updatedProducts.filter(
                  (_product) =>
                    _product?.product.id.toString() ==
                    order.product.id.toString()
                ).length == 0
              ) {
                let product = await Product.findById(order.product.id);

                let _newProduct = {
                  product: order.product.id,
                  restock_level: 0,
                  quantity: order.quantity * product?.sub_quantities,
                  price: null,
                };

                _vendor.update(
                  {
                    $addToSet: {
                      products: _newProduct,
                    },
                  },
                  async function (err, doc) {
                    await Order.findByIdAndUpdate(id, { status });
                    return doc.modifiedCount;
                  }
                );
              }
            }
          ).populate("products.product");
          break;

        case "unfulfilled":
          await Order.findByIdAndUpdate(id, { status });
          break;
      }
    },

    updateProduct: async (_, args) => {
      const { id, supplier: _supplier, quantity, restock_level, price } = args;

      await Product.findById(id, (err, product) => {
        if (err) return 0;
        let updatedSuppliers = product?.suppliers;

        updatedSuppliers.forEach((supplier) => {
          if (supplier.supplier.toString() == _supplier.toString()) {
            console.log("Found2");
            if (quantity) {
              supplier.quantity = supplier.quantity + quantity;
            }
            if (restock_level) {
              supplier.restock_level = restock_level;
            }
            if (price) {
              supplier.price = price;
            }
          }
        });

        console.log(updatedSuppliers);

        product.suppliers = updatedSuppliers;

        product.save();
        return 1;
      });

      return 0;
    },

    updatePriceVendor: async (_, args) => {
      const { product, vendor, price } = args;

      Vendor.findById(vendor, (err, _vendor) => {
        if (err) return 0;

        for (let i = 0; i < _vendor.products.length; i++) {
          if (_vendor.products[i].product.toString() == product.toString()) {
            _vendor.products[i].price = price;
            _vendor.save();
            return 1;
          }
        }
      });
    },

    removeProductVendor: async (_, args) => {
      const { product, vendor } = args;

      Vendor.findById(vendor, (err, _vendor) => {
        if (err) return 0;

        let updatedProducts = _vendor.products.filter(
          (_product) => _product.product.toString() !== product.toString()
        );

        _vendor.products = updatedProducts;

        _vendor.save();

        return 1;
      });
    },

    makeSale: async (_, args) => {
      const { product, quantity, vendor } = args;

      let sale = {
        product,
        quantity,
        timestamp: Date.now().toString(),
      };

      Vendor.findById(vendor, (err, _vendor) => {
        if (err) return 0;

        for (let i = 0; i < _vendor.products.length; i++) {
          if (_vendor?.products[i]?.product.toString() == product?.toString()) {
            console.log("Found");
            _vendor.products[i].quantity =
              _vendor.products[i].quantity - quantity;

            _vendor.sales = [..._vendor?.sales, sale];

            _vendor.save();
            return 1;
          }
        }
      });
    },

    removeProductSupplier: async (_, args) => {
      const { product, supplier } = args;

      Product.findById(product, (err, _product) => {
        if (err) return 0;

        for (let i = 0; i < _product.suppliers.length; i++) {
          if (
            _product.suppliers[i].supplier.toString() == supplier.toString()
          ) {
            _product.suppliers = [
              ..._product.suppliers.filter(
                (_supplier) =>
                  _supplier.supplier.toString() !== supplier.toString()
              ),
            ];

            _product.save();
            return 1;
          }
        }
      });
    },
  },
};

export default resolvers;
