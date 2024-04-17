import mongoose from 'mongoose';
import Category from "../models/category.model.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getCourses=asyncHandler(async (req,res)=>{
    try {
        const courses=await Course.find({}).populate('owner');
        return res.status(200).json({message:"Courses found Successfully",courses})
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"some error occured while getting courses")
    }

})

export const addCourse=asyncHandler(async (req,res)=>{
    try {
        const {title,description,category}=req.body
        if(!title||!description||!category){
            return res.status(401).send("*All fields are required");
        }
        const existingCategory=await Category.findOne({name:category});
        if(!existingCategory){
            return res.status(401).send("No such category found");
        }
        const thumbnailLocalPath=req.files?.thumbnail[0]?.path
        const videoLocalPath=req.files?.video[0]?.path
        if(!thumbnailLocalPath||!videoLocalPath){
            return res.status(404).send("Thumbnail and video are required!");
        }
        const thumbnailIsImage= req.files?.thumbnail[0].mimetype.startsWith('image');
        const videoIsVideo=req.files?.video[0]?.mimetype.startsWith("video");

        if(!thumbnailIsImage){
            return res.status(403).send("Uploaded thumbnail is not an image file!");
        }
        if(!videoIsVideo){
            return res.status(403).send("Uploaded file is not a video!");
        }
        const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);
        const video=await uploadOnCloudinary(videoLocalPath);
        const user=await User.findById(res.locals.jwtData.id);  
        const newCourse=await Course.create({
            title,
            description,
            thumbnail:thumbnail.url,
            video:video.url,
            category:existingCategory,
            owner:user,
        })

        const createdCourse=await Course.findById(newCourse._id);
        if(!createdCourse){
            throw new ApiError(500,"Some error occurred while adding course ,try later!")
        }
        
        return res.status(200).json({message:"Course added Successfully",newCourse})
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"some error occured while adding course")
    }

})

export const  getACourse=asyncHandler(async(req,res)=>{
    try {
        const {name}=req.params;
        const category=await Category.findOne({name});
        if(!category){
           return res.status(404).json({message:"No Such Category Found"})
        }
        const courses= await Course.find({category:category._id}).populate('owner');
        if(courses.length===0){
            return res.status(404).json({message:"No Courses Found"})
        }
        res.status(200).json({message:"ok",courses})
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"Something went wrong while getting course");
    }
})
//      Get Single Course
export const getSingleCourse=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    const course =await Course.findById(id).populate('owner');

    if (!course) {
        return res.status(404).json({ message: "This course does not exist!" });
    } 
    return res.status(200).json({message:"ok",course})
})


export const getTotalEnrolledUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const courseCount = await User.aggregate([
            {
                $match: {
                    $expr: { $in: [new mongoose.Types.ObjectId(id), '$courses'] }
                }
            },
            {
                $count: 'count'
            }   
        ]);

        if (courseCount.length === 0) {
            return res.status(404).send('Course not found or no users enrolled');
        }

        res.status(200).json({ message: 'Total enrolled users fetched successfully', courseCount });
    } catch (error) {
        console.log(error);
        throw new ApiError(500, 'Server Error while getting total enrolled user!');
    }
});

export const getOwner=asyncHandler(async(req,res)=>{
   try {
     const {id}=req.params;
     const owner=await User.findById(id);
     return res.status(200).json(owner)
   } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal Server error!'})
   }
})

export const deleteCourse=asyncHandler(async(req,res)=>{
    try {
        const {id}=req.params;
        await Course.findByIdAndDelete(id);
        return res.status(200).send("course deleted successfully!")
    } catch (error) {
        console.log(error);
        return res.status(500).send("server error!");
    }
})

// export const editCourse=asyncHandler(async(req,res)=>{
//     const {title,thumbnail,description,}
// })

export const getCourseUploadedByUser=asyncHandler(async(req,res)=>{
   try {
     const user = await User.findById(res.locals.jwtData.id);
       if (!user) {
         return res.status(404).json({ message: "No user found" });
       }
       const courses=await Course.aggregate([
         {
             $lookup:{
                 from:"users",
                 localField:"owner",
                 foreignField:"_id",
                 as: "ownerInfo"
             }
         },
         {
             $match:{
                 "ownerInfo._id":user._id
             }
         }
       ])
       return res.status(200).json({ courses });
   } catch (error) {
    console.log(error);
    return res.status(500).json({message:'Server Error',error});
   }
})
