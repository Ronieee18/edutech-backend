import { COOKIE_NAME } from "../constants.js";
import jwt from 'jsonwebtoken'

export const createToken=(id,email,name,expiresIn)=>{
    const payload={id,email,name};
    const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn})
    return token;
}
export const verifyToken=(req,res,next)=>{
    const token=req.signedCookies[`${COOKIE_NAME}`];
    if(!token||token.trim()===""){
        return res.status(401).json({message:"Token not found"})
    }
    return new Promise((resolve,reject)=>{
        return jwt.verify(token,process.env.JWT_SECRET,(err,success)=>{
            if(err){
                reject(err.message);
                return res.status(401).json({message:"Token expired"})
            }
            else{
                resolve();
                res.locals.jwtData=success;
                return next();

            }
        })
    })
}