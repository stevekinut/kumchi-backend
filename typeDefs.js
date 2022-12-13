const typeDefs = `

type Product{    
    id: ID! 
    image: String
    name: String   
    createdAt: String
    suppliers: [_Supplier]
    sub_quantities: Int   
}

type _Supplier{
    supplier: Supplier
    price: Int
    restock_level: Int
    quantity: Int
}

type Order {
    id: ID!
    product: Product
    price: Int
    quantity: Int
    vendor: Vendor
    supplier: Supplier
    description: String
    status: String 
    due_date: String
    actualization_date: String
    createdAt: String
    updatedAt: String
    paid: Int
}

type Vendor {
    id:ID!
    name: String
    username: String
    password: String
    phone_number: String
    products: [_Product]
    sales: [_Sale]
    order_requests: [Order]
   createdAt: String
}

type _Product{
    product: Product
    restock_level: Int
    quantity: Int
    price: Int
}

type _Sale{
    price: Int
    product: Product
    quantity: Int
    timestamp: String
}

type Supplier {
    id:ID!
    name: String
    username: String
    password: String
    phone_number: String
    products: [Product]   
    orders: [Order]
   createdAt: String
}

type Query {     
    getProducts : [Product]
    getProduct(id: ID) : Product
    getOrders(supplier: ID, vendor: ID): [Order]
    getVendors: [Vendor]
    getVendor(id: ID, username: String , password: String) : Vendor
    getSupplier(id: ID, username: String , password: String): Supplier
}

type Mutation {

     makeSale(
        product: ID
        quantity: Int     
        vendor: ID   
     ): Int

    addProductVendor(
        vendor: ID
        restock_level: Int
        price: Int        
        product: ID
    ): Int

    addProduct (   
        name: String
        sub_quantities: Int
        id: ID   
        price: Int!
        supplier: ID!
        quantity: Int  
        restock_level: Int   
    ) : Product  

    addSupplier (   
        name: String
        username: String
        password: String
        phone_number: String        
    ) : Supplier  

    addVendor (   
        name: String
        username: String
        password: String
        phone_number: String        
    ) : Vendor
    
    createOrder(
        product: ID!
        quantity: Int!
        vendor: ID!
        supplier: ID!
        description: String
        due_date: String        
    ) : Order

    updateOrder(
        id: ID
        status: String
    ) : Int   
    
    updateProduct(
        id: ID
        supplier: ID
        quantity: Int
        restock_level: Int
        price: Int
    ) : Int

    updatePriceVendor(
        product: ID
        vendor: ID
        price: Int
    ) : Int

    removeProductVendor(
        product: ID
        vendor: ID
    ): Int

    removeProductSupplier(
        product:ID
        supplier: ID
    ): Int
}

`;

export default typeDefs;
