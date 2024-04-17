import mongoose from "mongoose";    

const courseSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    video:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    enrolledUsers:{
        type:Number,
        default:0,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{timestamps:true})

const Course=mongoose.model("Course",courseSchema);

export default Course