import Instructor from "../models/instructor.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllInstructor=asyncHandler(async (req,res)=>{
    const instructors = await Instructor.find();
    return res.status(200).json(instructors);
})
export const createInstructor=asyncHandler(async(req,res)=>{
    try {
        const {experience,specialization,degree}=req.body;
        if(!experience || !specialization || !degree){
            return res.status(401).send("*All fields are required");
        }
        if(!req.files || !req.files.certificate || !req.files.resume){
            return res.status(404).send("degree and certificate are required!");
        }
        const certificateLocalPath=req.files?.certificate[0]?.path;
        const resumeLocalPath=req.files?.resume[0]?.path;

        if(!certificateLocalPath || !resumeLocalPath){
            return res.status(404).send("Degree Certificate and Resume are required!");
        }

       
        const certificateIsImage=req.files?.certificate[0]?.mimetype.startsWith('image');
        const resumeIsImage=req.files?.resume[0]?.mimetype.startsWith('image');
        if(!certificateIsImage || !resumeIsImage){
            return res.status(405).send("only image file is allowed");
        }
        const certificate=await uploadOnCloudinary(certificateLocalPath)
        const resume=await uploadOnCloudinary(resumeLocalPath)
        const newInstructor=await Instructor.create({
            degree,
            experience,
            specialization,
            certificate:certificate.url,
            resume:resume.url
        })
        const createdInstructor=await Instructor.findById(newInstructor._id);
        if(!createdInstructor){
            throw new ApiError(500, 'Something went wrong while creating instructor');
        }
        console.log(res.locals.jwtData);
        const user=await User.findByIdAndUpdate(res.locals.jwtData.id,{isInstructor:true});
        user.isInstructor=true;
        await user.save();
        return res.status(201).json({message:"instructor created succesfully",createInstructor});
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"some error occurred")
    }


})