import Category from "../models/category.model.js";
import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const  getAllCategories = asyncHandler(async(req, res)=>{
    try {
        const  categories=await Category.find();
        return res.status(200).json({message:"ok",categories});
    } catch (error) {
        console.log(error);
        throw new ApiError(500,'Server Error');
    }

})

export const feedCategories=asyncHandler(async(req,res)=> {
    try {
        const categories=[
            // {name:"Frontend Development"},
            // {name:"Backend Development"},
            // {name:"FullStack Development"},
            // {name:"Database Management"},
            {name:"Artificial Intelligence"},

        ]
        await Category.insertMany(categories);
        
        return res.status(200).json({message:"category added"})
    } catch (error) {
        console.log(error);
        throw new ApiError(500,'Server Error');
    }
})

export const getCategoryById=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    if(!id){
        throw new ApiError(404, 'Invalid category ID')
    }
    const category=await Category.findById(id);
    if(!category){
        throw new ApiError(404, 'category not found!')
    }
    return res.status(200).json(category)
})