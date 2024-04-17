import mongoose from "mongoose";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import nodemailer from "nodemailer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../constants.js";
import { createToken } from "../utils/tokenManager.js";
import Course from "../models/course.model.js";
import e from "express";

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ message: "ok", users });
  } catch (error) {
    throw new ApiError(500, "some error occured");
  }
});

export const userSignup = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new ApiError(400, "Name, email, and password are required.");
    }
    const existingUsername = await User.findOne({ name });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).send("User already Registered");
    }
    if (existingUsername) {
      return res.status(401).send("Username already taken!");
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPass });
    await user.save();
    return res.status(201).json({ message: "ok", user });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const userLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send("user not found");
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(403).send("Invalid credentials");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      expires,
      sameSite: "None",
      httpOnly: true,
      signed: true,
      secure: true,
    });
    const token = createToken(user._id.toString(), user.email, user.name, "7d");
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      expires,
      sameSite: "None",
      httpOnly: true,
      signed: true,
      secure: true,
    });
    return res
      .status(200)
      .json({ message: "user logged In successfully", user });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
export const verifyUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered  or token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match!");
    }
    return res.status(200).json({ message: "verified", user });
  } catch (error) {
    console.log(error);
    throw new ApiError(500, `error:${error.message}`);
  }
});

export const userLogout = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered  or token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match!");
    }

    res.clearCookie(COOKIE_NAME, {
      path: "/",
      sameSite: "None",
      httpOnly: true,
      signed: true,
      secure: true,
    });
    return res.status(200).send("user logout successfull");
  } catch (error) {
    console.log(error);
    throw new ApiError(500, `Logout error:${error.message}`);
  }
});

export const EnrollInCourse = asyncHandler(async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $inc: { enrolledUsers: 1 } },
      { new: true }
    );
    if (!course) {
      return res.status(404).send("course not found");
    }

    console.log(res.locals.jwtData.id);
    const user = await User.findById(res.locals.jwtData.id);
    //checking if the user is already enrolled in this course
    if (user.courses.includes(courseId)) {
      return res.status(400).send("course already enrolled!");
    }
    // course.enrolledUsers+=1;
    user.courses.push(courseId);

    // const user=await User.findByIdAndUpdate(
    //     res.locals.jwtData.id,
    //     {$push:{courses:course}},
    //     {new:true}
    //     );
    await user.save();
    // console.log(user);
    return res.status(200).json({ message: "ok", user });
  } catch (error) {
    console.log(error);
  }
});

export const getEnrolledCourses = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }
    const courseIds = user.courses;
    // console.log(courseIds);
    const courses = await Course.find({
      _id: {
        $in: courseIds,
      },
    }).populate("owner");
    return res.status(200).json({ courses });
  } catch (error) {
    // Handle any unexpected errors--------
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

export const removeCourse = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }
    const courseIndex = user.courses.indexOf(id);
    if (courseIndex === -1) {
      return res.status(404).send("Course not found in enrolled courses!!");
    }
    user.courses.splice(courseIndex, 1);
    await user.save();
    return res
      .status(200)
      .json({ message: "course removed successsfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).send("some error occured while removing course!");
  }
});

// export const forgotPass=asyncHandler(async(req,res)=>{
//     try {
//         const {email}=req.body
//         const secret=speakeasy.generateSecret();
//         console.log(secret);
//         const otp=speakeasy.totp({
//             secret:speakeasy.base32,
//             encoding:'base32'
//         });
//         console.log(otp);
//         const transporter=nodemailer.createTransport({
//             service:'gmail',
//             auth:{
//                 user:process.env.EMAIL_ID,
//                 pass:process.env.APP_PASSWORD
//             }
//         })
//         const mailOptions={
//             from:process.env.EMAIL_ID,
//             to:email,
//             subject:'OTP for Changing your Password on Edutech',
//             text:`Your OTP is ${otp}\nPlease keep it safe`
//         }
//         const info=await transporter.sendMail(mailOptions);
//         console.log("email sent:",info);

//         return res.status(200).send("opt sent succesfully")
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({message:"server error!"})
//     }
// })

// export const verifyOtp = asyncHandler(async (req, res) => {
//   try {
//     const { otp } = req.body;
//     const secret = speakeasy.generateSecret();
//     const isVerified = speakeasy.totp.verify({
//       secret: secret.base32,
//       encoding: "base32",
//       token: otp,
//       window: 4,
//     });
//     if (!isVerified) {
//       return res.status(400).send("OTP Incorrect OR EXPIRED!");
//     }
//     return res.status(200).send("otp verified!");
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("Error verifying OTP!");
//   }
// });

export const forgotPass = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if(!email){
      return res.status(404).send("email Not found")
    }
    const user=await User.findOne({email})
    if(!user){
        return res.status(404).send("User Not found")
    }
    const token = jwt.sign({id:user._id}, "jwt_secret_key", { expiresIn: "300s" });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.APP_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Click below Link for Changing your Password on Edutech",
      text: `http://localhost:5173/reset-password/${user._id}/${token}`,
    };
      transporter.sendMail(mailOptions,function(error,info){
          if(error){
              console.log(error);
          }
          else{
              return res.status(200).send({status:"success"})
          }
    });
  } catch (error) {
    console.log(error);
    return  res.status(500).json({ status: "failure", message: error.message });
  }
});
export const verifyOtp = asyncHandler(async(req, res) => {
   try {
    const {id,token}=req.params;
    const {password}=req.body;
    jwt.verify(token,"jwt_secret_key",async(err,decoded)=>{
     if(err){
         console.log(err);
         return res.status(401).json({status:'failed',msg:'Invalid Token'});
     }
     else{
        try {
            const hashedPass = await bcrypt.hash(password, 10);
            const updatedUser=await User.findByIdAndUpdate(id,{password:hashedPass},{new:true})
            return res.status(200).json({ status: 'success', msg: 'Password updated successfully', user: updatedUser })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 'failed', msg: 'Error updating password' });

        }
        
     }
    })
   } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'failed', msg: 'Internal Server Error' });
  
   }

  });

export const changePassword=asyncHandler(async(req,res)=>{
  try {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(res.locals.jwtData.id);
      if (!user) {
        return res.status(404).json({ message: "No user found" });
      }
      if(!oldPassword){
        return res.status(404).send("enter old password");
      }
      if(!newPassword){
        return res.status(404).send("enter new password");
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).send("Wrong old Password!");
      }
      const hashedPass = await bcrypt.hash(newPassword, 10);
      const updatedUser=await User.findByIdAndUpdate(user._id,{password:hashedPass},{new:true})
      return res.status(200).send("Password updated Successfully")
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"Server error"});
  }
    
})
