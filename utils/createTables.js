import { createOrderItemsTable } from "../models/orderItemsTable.js"
import { createOrdersTable } from "../models/ordersTable.js"
import { createPaymentsTable } from "../models/paymentsTable.js"
import { createProductReviewsTable } from "../models/productReviewsTable.js"
import { createProductTable } from "../models/productTable.js"
import { createShippingInfoTable } from "../models/shippinginfoTable.js"
import { createUserTable } from "../models/userTable.js"

export const createTables = async () => {
    try {
        await createUserTable()
        await createProductTable()
        await createProductReviewsTable()
        await createOrdersTable()
        await createOrderItemsTable()
        await createPaymentsTable()
        await createShippingInfoTable()
    } catch (error) {
        console.error("Error while creating tables: ", error)
    }
}