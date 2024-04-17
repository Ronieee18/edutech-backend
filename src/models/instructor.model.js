import mongoose from "mongoose";

const instructorSchema=new mongoose.Schema({
    experience: {type: Number, required: true},
    specialization:{ type: String ,required :true },
    degree: { type: String,required:true },
    certificate:{type:String,required:true},
    resume:{type: String,required:true}
},{timestamps:true})

const Instructor=mongoose.model("Instructor",instructorSchema);
export default Instructor