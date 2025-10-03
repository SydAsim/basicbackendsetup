import { ApiError } from "../utils/ApiErrors.js";
import { asynhandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'


// This middleware is used to verify whether the incoming request has a valid JWT
//  (access token) before allowing it to access protected routes (like /profile, /dashboard, etc.).


export const verifyJWT  = asynhandler(async (req , res , next)=>{
    try {
 // 1. Get token from either cookies or Authorization header from JWT It comes from jwt.sign(...) in your backend code.
        const token = req.cookies?.accessToken ||
         req.header("Authorization")?.replace ("Bearer " ,  "")
        

         if (!token){
            throw new ApiError(404 , "Unauthorized request")
         }
        
         // 2. Verify the token using the secret
        const decodedToken = jwt.verify(token ,process.env.ACCESS_TOKEN_SECRET)
    
        // 3. Find the user in DB using decoded _id

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken")
    
        if(!user) {
            // TODO : DISCUSS ABOUT FRONTEND
            throw new ApiError(401 , "Invalid Access Token")
        }
    
        // 4. Attach user object to req for next middleware/controller
        req.user = user ;
        next()
    
    } catch (error) {
        throw new ApiError(401 , error?.message ||"Invalid Access Token")
        
    }

})