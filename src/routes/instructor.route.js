import { Router } from "express";
import { verifyToken } from "../utils/tokenManager.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createInstructor, getAllInstructor } from "../controllers/instructor.controller.js";

const instructorRouter = Router();

instructorRouter.use(verifyToken);

instructorRouter.get('/', getAllInstructor);

instructorRouter.post(
  '/addInstructor',
  upload.fields([
    {
      name: "certificate",
      maxCount: 1,
    },
    {
      name: "resume",
      maxCount: 1,
    },
  ]),
  createInstructor
);

export default instructorRouter;
