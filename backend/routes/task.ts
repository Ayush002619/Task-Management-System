import { Router } from "express";
import { createTask, getTasks, updateTask, deleteTask, toggleTaskStatus } from "../controllers/task";
import { authenticate } from "../middleware/middleware";
const router = Router();

router.post("/", authenticate, createTask); //create new task
router.get("/", authenticate, getTasks);    //get all task
router.patch("/:id", authenticate, updateTask); //Edit task
router.delete("/:id", authenticate, deleteTask); //delete task
router.patch("/:id/toggle", authenticate, toggleTaskStatus); //status toggle

export default router;