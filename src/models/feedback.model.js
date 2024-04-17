import mongoose from "mongoose";

const feedbackSchema=new mongoose.Schema({
    name:{type:String,required:true},
    comment: { type: String , required : true },  // the user's comment
},{timestamps:true})

const Feedback=mongoose.model("Feedback",feedbackSchema)
export default Feedback;