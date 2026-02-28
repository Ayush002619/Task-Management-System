import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import { authenticate } from "./middleware/middleware"
import taskRoutes from "./routes/task";

const app = express();
app.use(cors({
    origin: "https://task-management-system-2-xq8r.onrender.com/",
    credentials: true
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.get("/test", authenticate, (req, res) => {
    res.json({ message: "Protected route working" });
});
app.use("/tasks", taskRoutes);
export default app;