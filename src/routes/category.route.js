import { Router } from "express";
import { feedCategories, getAllCategories, getCategoryById } from "../controllers/category.controller.js";
import { verifyToken } from "../utils/tokenManager.js";
const  categoryRouter=Router();
categoryRouter.use(verifyToken)
categoryRouter.get('/',getAllCategories)
categoryRouter.get('/feedCategory',feedCategories)
categoryRouter.get('/:id',getCategoryById)


export default categoryRouter