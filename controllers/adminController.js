import database from "../database/db.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;

  const totalUsersResult = await database.query(
    `SELECT COUNT(*) FROM users WHERE role = $1`,
    ["User"]
  );

  const totalUsers = parseInt(totalUsersResult.rows[0].count);

  const offset = (page - 1) * 10;

  const users = await database.query(
    `SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    ["User", 10, offset]
  );

  res.status(200).json({
    success: true,
    totalUsers,
    currentPage: page,
    users: users.rows,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const deleteUser = await database.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id]
  );

  if (deleteUser.rows.length === 0) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const avatar = deleteUser.rows[0].avatar;
  if (avatar?.public_id) {
    await cloudinary.uploader.destroy(avatar.public_id);
  }
  res.status(200).json({
    success: true,
    message: "User deleted successfully.",
  });
});

export const dashboardStats = catchAsyncError(async (req, res, next) => {
  const today = new Date();

  const todayDate = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const previousMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  //Total price
  const totalRevenueAllTimeQuery = await database.query(
    `SELECT SUM(total_price) FROM orders`
  );

  const totalRevenueAllTime =
    parseInt(totalRevenueAllTimeQuery.rows[0].sum) || 0;

  //Total users
  const totalUsersCountQuery = await database.query(
    `SELECT COUNT(*) FROM users WHERE role = $1`,
    ["User"]
  );

  const totalUsersCount = parseInt(totalUsersCountQuery.rows[0].count) || 0;

  //Total status counts
  const orderStatusCountQuery = await database.query(
    `SELECT order_status, COUNT(*) FROM orders GROUP BY order_status`
  );

  const orderStatusCounts = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };
  orderStatusCountQuery.rows.forEach((row) => {
    orderStatusCounts[row.order_status] = parseInt(row.count);
  });

  //Today's Revenue
  const todayRevenueQuery = await database.query(
    `SELECT SUM(total_price) FROM orders WHERE created_at::date = $1`,
    [todayDate]
  );

  const todayRevenue = parseInt(todayRevenueQuery.rows[0].sum) || 0;

  //Yesterday's Revenue
  const yesterdayRevenueQuery = await database.query(
    `SELECT SUM(total_price) FROM orders WHERE created_at::date = $1`,
    [yesterdayDate]
  );

  const yesterdayRevenue = parseInt(yesterdayRevenueQuery.rows[0].sum) || 0;

  //Monthly Sales for Linechart
  const monthlySalesQuery = await database.query(
    `SELECT 
    TO_CHAR(created_at, 'Mon YYYY') AS month, 
    DATE_TRUNC('month', created_at) AS date, 
    SUM(total_price) AS totalSales
    FROM orders
    GROUP BY month, date
    ORDER BY date DESC`
  );

  const monthlySales = monthlySalesQuery.rows.map((row) => ({
    month: row.month,
    totalSales: parseInt(row.totalSales) || 0,
  }));

  const topSellingProductsQuery = await database.query(
    `SELECT p.name, 
    p.images->0->>'url' AS image, 
    p.category,
    p.ratings,
    SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.name, p.category, p.images, p.ratings
    ORDER BY total_sold DESC
    LIMIT 5`
  );

  const topSellingProducts = topSellingProductsQuery.rows;

  //Total Sales of the current Month
  const currentMonthSalesQuery = await database.query(
    `SELECT SUM(total_price) as total 
    FROM orders 
    WHERE created_at BETWEEN $1 AND $2`,
    [currentMonthStart, currentMonthEnd]
  );

  const currentMonthSales = parseInt(currentMonthSalesQuery.rows[0].total) || 0;

  //Products with stock less than or equal to 5
  const lowStockProductsQuery = await database.query(
    `SELECT name, stock FROM products WHERE stock <= 5`
  )

  const lowStockProducts = lowStockProductsQuery.rows

  //Revenue growth rate (%)
  const lastMonthRevenueQuery = await database.query(
    `SELECT SUM(total_price) as total 
    FROM orders 
    WHERE created_at BETWEEN $1 AND $2`,
    [previousMonthStart, previousMonthEnd]
  );

  const lastMonthRevenue = parseInt(lastMonthRevenueQuery.rows[0].total) || 0;

  let revenueGrowth = "0%"
  if(lastMonthRevenue > 0){
    const growthRate = ((currentMonthSales - lastMonthRevenue) / lastMonthRevenue) * 100
    revenueGrowth = `${growthRate > 0 ? "+" : ""}${growthRate.toFixed(2)}%`
  }
  

  const newUsersThisMonthQuery = await database.query(
    `SELECT COUNT(*) FROM users WHERE created_at >= $1 AND role = $2`, [currentMonthStart, 'User']
  )

  const newUsersThisMonth = parseInt(newUsersThisMonthQuery.rows[0].count) || 0

  res.status(200).json({
    success: true,
    message: "Dashboard Stats Fetched Successfully.",
    totalRevenueAllTime,
    todayRevenue,
    yesterdayRevenue,
    totalUsersCount,
    orderStatusCounts,
    monthlySales,
    topSellingProducts,
    currentMonthSales,
    lowStockProducts,
    revenueGrowth,
    newUsersThisMonth
  })
});
