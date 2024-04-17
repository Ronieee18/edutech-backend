import { Router } from "express";
import { verifyToken } from "../utils/tokenManager.js";
import { getallFeedbacks, postFeedback } from "../controllers/feedback.controller.js";
const  feedbackRouter = Router();
// feedbackRouter.use(verifyToken);
feedbackRouter.get('/',getallFeedbacks);
feedbackRouter.post('/',verifyToken,postFeedback);
export default feedbackRouter
