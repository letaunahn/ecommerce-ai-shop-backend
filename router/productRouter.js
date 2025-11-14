import express from "express";
import {
  authorizedRoles,
  isAuthenticated,
} from "../middlewares/authMiddleware.js";
import { createProduct, deleteProduct, deleteReview, fetchAIFilteredProduct, fetchAllProducts, fetchSingleProduct, postProductReview, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post(
  "/admin/create",
  isAuthenticated,
  authorizedRoles("Admin"),
  createProduct
);

productRouter.get("/", fetchAllProducts)
productRouter.put("/admin/update/:productId", isAuthenticated, authorizedRoles("Admin"), updateProduct)
productRouter.delete("/admin/delete/:productId", isAuthenticated, authorizedRoles("Admin"), deleteProduct)
productRouter.get("/singleProduct/:productId", fetchSingleProduct)
productRouter.put("/post-new/review/:productId", isAuthenticated, postProductReview)
productRouter.delete("/review/delete/:productId", isAuthenticated, deleteReview)
productRouter.post("/ai-search", isAuthenticated, fetchAIFilteredProduct)

export default productRouter;
