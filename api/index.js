import "dotenv/config";
import connectDB from "../server/db/index.js";
import { app } from "./app.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure public/images directory exists at startup
const imagesDir = path.resolve(__dirname, "../public/images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
if(process.env.NODE_ENV !== "production") {

  const PORT = process.env.PORT || 8000;
}
// Export the app for Vercel
export default app;
connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("❌ Server error:", err);
      throw err;
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🔗 Health check: http://localhost:${PORT}/api/v1/healthcheck`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });
