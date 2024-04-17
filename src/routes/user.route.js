import { Router } from "express";
import { changePassword, forgotPass, getAllUsers, getEnrolledCourses, removeCourse, userLogin, userLogout, userSignup, verifyOtp, verifyUser } from "../controllers/user.controller.js";
import { loginValidator, signupValidator, validate } from "../utils/validator.js";
import { verifyToken } from "../utils/tokenManager.js";

const userRouter=Router();
userRouter.get('/',getAllUsers)
userRouter.post('/forgotPass',forgotPass);
userRouter.post('/changePassword',verifyToken,changePassword);
userRouter.post('/reset-password/:id/:token',verifyOtp);

userRouter.post('/signup',validate(signupValidator),userSignup)
userRouter.post('/login',validate(loginValidator),userLogin)
userRouter.get('/logout',verifyToken,userLogout)
userRouter.get('/auth-status',verifyToken,verifyUser)
userRouter.get('/enrolledcourses',verifyToken,getEnrolledCourses)
userRouter.delete('/removecourse/:id',verifyToken,removeCourse)


export default userRouter