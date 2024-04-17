import { Router } from "express";
import { verifyToken } from "../utils/tokenManager.js";
import { getallFeedbacks, postFeedback } from "../controllers/feedback.controller.js";
const  feedbackRouter = Router();
feedbackRouter.use(verifyToken);
feedbackRouter.get('/',getallFeedbacks);
feedbackRouter.post('/',postFeedback);
export default feedbackRouter
