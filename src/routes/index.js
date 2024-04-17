import { Router } from "express";
import userRouter from "./user.route.js";
import categoryRouter from "./category.route.js";
import courseRouter from "./course.route.js";
import instructorRouter from "./instructor.route.js";
import feedbackRouter from "./feedback.route.js";
const router=Router();
router.use('/user',userRouter)
router.use('/courseCategory',categoryRouter)
router.use('/courses',courseRouter)
router.use('/instructor',instructorRouter)
router.use('/feedback',feedbackRouter)
export default router