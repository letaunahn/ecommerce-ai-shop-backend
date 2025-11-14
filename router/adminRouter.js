import express from "express"
import { authorizedRoles, isAuthenticated } from "../middlewares/authMiddleware.js"
import { dashboardStats, deleteUser, getAllUsers } from "../controllers/adminController.js"

const adminRouter = express.Router()

adminRouter.get("/getallusers", isAuthenticated, authorizedRoles("Admin"), getAllUsers)
adminRouter.delete("/delete/:id", isAuthenticated, authorizedRoles("Admin"), deleteUser)
adminRouter.get("/fetch/dashboard-stats", isAuthenticated, authorizedRoles("Admin"), dashboardStats)

export default adminRouter