import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const  getallFeedbacks= asyncHandler(async (req, res) =>{
    try {
        const feedback = await Feedback.find();
        res.status(200).json({success:true ,data : feedback});
    } catch (error) {
        return  res.status(500).json({message: error.message})
    }
})

export const postFeedback=asyncHandler(async(req,res)=>{
    try {
        const {comment}=req.body;
        if(!comment){
            return res.status(400).json({message:"Please fill all fields"});
        }
        const user=await User.findById(res.locals.jwtData.id);
        const feedback = await Feedback.create({name:user.name, comment});
        return res.status(200).send("feedback submitted!")
    } catch (error) {
        return  res.status(500).json({message: error.message})
    }
})