const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Kiểm tra dữ liệu cho POST và PUT.
function validateProduct(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      message: "Body phải là một đối tượng JSON",
    });
  }

  const { pid, pname, price, quantity } = body;

  if (typeof pid !== "string" || !pid.trim()) {
    return res.status(400).json({
      message: "pid phải là chuỗi không rỗng",
    });
  }

  if (typeof pname !== "string" || !pname.trim()) {
    return res.status(400).json({
      message: "pname phải là chuỗi không rỗng",
    });
  }

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return res.status(400).json({
      message: "price phải là số hữu hạn lớn hơn hoặc bằng 0",
    });
  }

  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    return res.status(400).json({
      message: "quantity phải là số nguyên không âm trong phạm vi an toàn",
    });
  }

  // Chỉ lấy bốn trường cho phép.
  req.productData = {
    pid: pid.trim(),
    pname: pname.trim(),
    price,
    quantity,
  };

  next();
}

// CREATE: thêm sản phẩm.
router.post("/", validateProduct, async (req, res) => {
  const product = await Product.create(req.productData);

  res.status(201).json(product);
});

// READ: lấy danh sách sản phẩm.
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ pid: 1 });

  res.status(200).json(products);
});

// READ: lấy một sản phẩm theo pid.
router.get("/:pid", async (req, res) => {
  const product = await Product.findOne({
    pid: req.params.pid,
  });

  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  res.status(200).json(product);
});

// UPDATE: cập nhật đầy đủ bốn trường của sản phẩm.
router.put("/:pid", validateProduct, async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { pid: req.params.pid },
    { $set: req.productData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  res.status(200).json(product);
});

// DELETE: xóa sản phẩm theo pid.
router.delete("/:pid", async (req, res) => {
  const product = await Product.findOneAndDelete({
    pid: req.params.pid,
  });

  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  res.status(200).json({
    message: "Xóa sản phẩm thành công",
    pid: product.pid,
  });
});

module.exports = router;