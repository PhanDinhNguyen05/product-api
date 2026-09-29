const express = require("express");
const productRoutes = require("./routes/productRoutes");

const app = express();
const mongoose = require("mongoose");

app.use(express.json());

app.use("/api/products", productRoutes);

// Xử lý đường dẫn không tồn tại.
app.get("/health", async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "unhealthy",
        api: "up",
        mongodb: "unavailable",
      });
    }

    const result = await mongoose.connection.db.admin().command({
      ping: 1,
      maxTimeMS: 2000,
    });

    if (result.ok !== 1) {
      throw new Error("MongoDB ping thất bại");
    }

    return res.status(200).json({
      status: "healthy",
      api: "up",
      mongodb: "up",
    });
  } catch (error) {
    return res.status(503).json({
      status: "unhealthy",
      api: "up",
      mongodb: "unavailable",
    });
  }
});
app.use((req, res) => {
  res.status(404).json({
    message: "Đường dẫn API không tồn tại",
  });
});

// Middleware xử lý lỗi phải đặt sau các routes.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "JSON không hợp lệ",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "pid đã tồn tại",
    });
  }

  if (
    err.name === "ValidationError" ||
    err.name === "CastError"
  ) {
    return res.status(400).json({
      message: err.message,
    });
  }

  console.error("Lỗi xử lý API:", err.message);

  res.status(500).json({
    message: "Lỗi máy chủ",
  });
});

module.exports = app;