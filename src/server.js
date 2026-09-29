require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const Product = require("./models/Product");

async function startServer() {
  const { PORT, MONGODB_URI } = process.env;
  const port = Number(PORT);

  if (!MONGODB_URI) {
    throw new Error("Thiếu MONGODB_URI trong .env");
  }

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error("PORT trong .env phải là số từ 1 đến 65535");
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  // Đợi tạo chỉ mục unique cho pid trước khi nhận request.
  await Product.init();

  console.log("Đã kết nối MongoDB");
  console.log(`Database: ${mongoose.connection.name}`);

  app.listen(port, (error) => {
    if (error) {
      console.error("Không thể mở cổng API:", error.message);
      process.exit(1);
    }

    console.log(`API đang chạy tại http://localhost:${port}`);
  });
}

startServer().catch(async (error) => {
  console.error("Khởi động thất bại:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});