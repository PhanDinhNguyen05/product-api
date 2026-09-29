async function checkHealth() {
  try {
    const port = process.env.PORT;

    if (!port) {
      throw new Error("Thiếu PORT");
    }

    const response = await fetch(
      `http://127.0.0.1:${port}/health`,
      {
        signal: AbortSignal.timeout(4000),
      }
    );

    if (response.status !== 200) {
      throw new Error(`Health endpoint trả HTTP ${response.status}`);
    }

    const body = await response.json();

    if (
      body.status !== "healthy" ||
      body.mongodb !== "up"
    ) {
      throw new Error("API hoặc MongoDB chưa sẵn sàng");
    }

    console.log("Product API và MongoDB hoạt động bình thường");
    process.exit(0);
  } catch (error) {
    console.error("Healthcheck thất bại:", error.message);
    process.exit(1);
  }
}

checkHealth();