import express from 'express';
import { authorizedRoles, isAuthenticated } from '../middlewares/authMiddleware.js';
import { deleteOrder, fetchAllOrders, fetchMyOrders, fetchSingleOrder, placeNewOrder, updateOrderStatus } from '../controllers/orderController.js';

const orderRouter = express.Router()

orderRouter.post("/new", isAuthenticated, placeNewOrder)
orderRouter.get("/:orderId", isAuthenticated, fetchSingleOrder)
orderRouter.get("/orders/me", isAuthenticated, fetchMyOrders)
orderRouter.get("/admin/get-all", isAuthenticated, authorizedRoles("Admin"), fetchAllOrders)
orderRouter.put("/admin/update/:orderId", isAuthenticated, authorizedRoles("Admin"), updateOrderStatus)
orderRouter.delete("/admin/delete/:orderId", isAuthenticated, authorizedRoles("Admin", deleteOrder))

export default orderRouter