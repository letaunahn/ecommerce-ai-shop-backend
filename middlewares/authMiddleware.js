import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./errorMiddleware.js";
import database from "../database/db.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  if (!decoded) {
    return next(
      new ErrorHandler("Invalid or expired token, please login again.", 401)
    );
  }

  const user = await database.query(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [decoded.id]
  );

  if (user.rows.length === 0) {
    return next(new ErrorHandler("User not found.", 404));
  }
  req.user = user.rows[0];
  next();
});

export const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource.`,
          403
        )
      );
    }
    next();
  };
};
